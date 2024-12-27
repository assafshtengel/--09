import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, addDays } from "date-fns";

export const useWeeklySchedule = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveSchedule = async (activities: any[]) => {
    setIsLoading(true);
    try {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 6 }); // Start from Saturday
      
      const { data: scheduleData, error: scheduleError } = await supabase
        .from("weekly_schedules")
        .insert({
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

  return {
    saveSchedule,
    isLoading,
  };
};