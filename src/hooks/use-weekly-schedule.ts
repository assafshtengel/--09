import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek } from "date-fns";
import { toast } from "sonner";

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export const useWeeklySchedule = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10
  });

  const saveSchedule = async (activities: any[]) => {
    console.log("Saving schedule with activities:", activities);
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const startDate = startOfWeek(new Date(), { weekStartsOn: 6 }); // Start from Saturday
      
      // Create new schedule with optimized query
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("weekly_schedules")
        .insert({
          player_id: user.id,
          start_date: startDate.toISOString(),
        })
        .select('id')
        .single();

      if (scheduleError) throw scheduleError;

      // Batch insert activities with optimized query
      if (activities.length > 0) {
        const { error: activitiesError } = await supabase
          .from("schedule_activities")
          .insert(
            activities.map(activity => ({
              schedule_id: scheduleData.id,
              ...activity
            }))
          );

        if (activitiesError) throw activitiesError;
      }
      
      return scheduleData.id;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScheduleActivities = async (scheduleId: string, page: number = 1) => {
    const { from, to } = getPaginationRange(page, pagination.itemsPerPage);
    
    const { data, error } = await supabase
      .from("schedule_activities")
      .select('*')
      .eq('schedule_id', scheduleId)
      .range(from, to)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error("Error fetching activities:", error);
      toast.error("שגיאה בטעינת הפעילויות");
      return [];
    }

    return data;
  };

  const getPaginationRange = (page: number, itemsPerPage: number) => {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    return { from, to };
  };

  const updatePagination = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  return {
    saveSchedule,
    fetchScheduleActivities,
    updatePagination,
    pagination,
    isLoading,
  };
};