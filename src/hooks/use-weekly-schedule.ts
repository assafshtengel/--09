import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek } from "date-fns";
import { toast } from "sonner";

export const useWeeklySchedule = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveSchedule = async (activities: any[]) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const startDate = startOfWeek(new Date(), { weekStartsOn: 6 }); // Start from Saturday
      
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("weekly_schedules")
        .insert({
          player_id: user.id,
          start_date: startDate.toISOString(),
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      const { error: activitiesError } = await supabase
        .from("schedule_activities")
        .insert(
          activities.map(activity => ({
            schedule_id: scheduleData.id,
            ...activity
          }))
        );

      if (activitiesError) throw activitiesError;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSchedule = async (scheduleId: string, activities: any[]) => {
    setIsLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from("schedule_activities")
        .delete()
        .eq("schedule_id", scheduleId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("schedule_activities")
        .insert(
          activities.map(activity => ({
            schedule_id: scheduleId,
            ...activity
          }))
        );

      if (insertError) throw insertError;

      toast.success("המערכת עודכנה בהצלחה");
    } catch (error) {
      toast.error("שגיאה בעדכון המערכת");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveSchedule,
    updateSchedule,
    isLoading,
  };
};