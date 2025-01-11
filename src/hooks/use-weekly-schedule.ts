import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek } from "date-fns";
import { toast } from "sonner";

export const useWeeklySchedule = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveSchedule = async (scheduleData: any) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const startDate = startOfWeek(new Date(), { weekStartsOn: 6 }); // Start from Saturday
      
      // Save the weekly schedule
      const { data: scheduleRecord, error: scheduleError } = await supabase
        .from("weekly_schedules")
        .insert({
          player_id: user.id,
          start_date: startDate.toISOString(),
          notes: scheduleData.notes,
          status: 'draft'
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Convert schedule data to activities
      const activities = [
        // Sleep activities
        ...Object.entries(scheduleData.sleep).map(([day, times]: [string, any]) => ({
          schedule_id: scheduleRecord.id,
          activity_type: 'wake_up',
          day_of_week: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day),
          start_time: times.start,
          end_time: times.end,
        })),
        
        // Team practices
        ...scheduleData.teamPractices.map((practice: any) => ({
          schedule_id: scheduleRecord.id,
          activity_type: 'team_training',
          day_of_week: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(practice.day),
          start_time: practice.time,
          end_time: practice.time, // TODO: Add duration
        })),
        
        // Personal training
        ...scheduleData.personalTraining.map((training: any) => ({
          schedule_id: scheduleRecord.id,
          activity_type: 'personal_training',
          day_of_week: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(training.day),
          start_time: training.time,
          end_time: training.time, // TODO: Add duration
        })),
        
        // Games
        ...scheduleData.games.map((game: any) => ({
          schedule_id: scheduleRecord.id,
          activity_type: 'team_game',
          day_of_week: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(game.day),
          start_time: game.time,
          end_time: game.time, // TODO: Add duration
        })),
      ];

      // Save all activities
      const { error: activitiesError } = await supabase
        .from("schedule_activities")
        .insert(activities);

      if (activitiesError) throw activitiesError;
      
      toast.success("Schedule saved successfully");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveSchedule,
    isLoading,
  };
};