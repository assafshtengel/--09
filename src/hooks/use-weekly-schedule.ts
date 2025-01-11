import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek } from "date-fns";
import { toast } from "sonner";

export const useWeeklySchedule = () => {
  const [isLoading, setIsLoading] = useState(false);

  const mapActivityType = (type: string) => {
    switch (type) {
      case 'school':
        return 'school';
      case 'team_training':
        return 'team_training';
      case 'personal_training':
        return 'personal_training';
      case 'special_event':
        return 'other';
      case 'game':
        return 'team_game';
      default:
        return 'other';
    }
  };

  const saveSchedule = async (scheduleData: any) => {
    if (!scheduleData) {
      throw new Error("Schedule data is required");
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const startDate = startOfWeek(new Date(), { weekStartsOn: 6 }); // Start from Saturday
      
      // Save the weekly schedule with valid status values
      const { data: scheduleRecord, error: scheduleError } = await supabase
        .from("weekly_schedules")
        .insert({
          player_id: user.id,
          start_date: startDate.toISOString(),
          notes: scheduleData.notes || '',
          status: 'draft', // Explicitly set status to 'draft'
          is_active: true
        })
        .select()
        .single();

      if (scheduleError) {
        console.error("Error creating weekly schedule:", scheduleError);
        throw scheduleError;
      }

      console.log("Created weekly schedule:", scheduleRecord);

      // Convert schedule data to activities
      const activities = [];

      // Add school activities
      if (scheduleData.schoolDays && scheduleData.schoolHours) {
        scheduleData.schoolDays.forEach((day: string) => {
          if (day !== 'אין לימודים השבוע' && scheduleData.schoolHours[day]) {
            const dayIndex = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].indexOf(day);
            if (dayIndex !== -1 && scheduleData.schoolHours[day].start && scheduleData.schoolHours[day].end) {
              activities.push({
                schedule_id: scheduleRecord.id,
                activity_type: mapActivityType('school'),
                day_of_week: dayIndex,
                start_time: scheduleData.schoolHours[day].start,
                end_time: scheduleData.schoolHours[day].end,
                title: 'בית ספר'
              });
            }
          }
        });
      }

      // Add team training activities
      if (Array.isArray(scheduleData.teamTraining)) {
        scheduleData.teamTraining.forEach((training: any) => {
          const dayIndex = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].indexOf(training.day);
          if (dayIndex !== -1) {
            activities.push({
              schedule_id: scheduleRecord.id,
              activity_type: mapActivityType('team_training'),
              day_of_week: dayIndex,
              start_time: training.startTime,
              end_time: training.endTime,
              title: training.description || 'אימון קבוצתי'
            });
          }
        });
      }

      // Add personal training activities
      if (Array.isArray(scheduleData.personalTraining)) {
        scheduleData.personalTraining.forEach((training: any) => {
          const dayIndex = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].indexOf(training.day);
          if (dayIndex !== -1) {
            activities.push({
              schedule_id: scheduleRecord.id,
              activity_type: mapActivityType('personal_training'),
              day_of_week: dayIndex,
              start_time: training.startTime,
              end_time: training.endTime,
              title: training.description || 'אימון אישי'
            });
          }
        });
      }

      // Add special events
      if (Array.isArray(scheduleData.specialEvents)) {
        scheduleData.specialEvents.forEach((event: any) => {
          const dayIndex = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].indexOf(event.day);
          if (dayIndex !== -1) {
            activities.push({
              schedule_id: scheduleRecord.id,
              activity_type: mapActivityType('special_event'),
              day_of_week: dayIndex,
              start_time: event.startTime,
              end_time: event.endTime,
              title: event.description
            });
          }
        });
      }

      // Add games
      if (Array.isArray(scheduleData.games)) {
        scheduleData.games.forEach((game: any) => {
          const dayIndex = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].indexOf(game.day);
          if (dayIndex !== -1) {
            activities.push({
              schedule_id: scheduleRecord.id,
              activity_type: mapActivityType('game'),
              day_of_week: dayIndex,
              start_time: game.startTime,
              end_time: game.startTime, // For games we just use start time
              title: game.description || 'משחק'
            });
          }
        });
      }

      // Save all activities if there are any
      if (activities.length > 0) {
        console.log('Saving activities:', activities);
        const { error: activitiesError } = await supabase
          .from("schedule_activities")
          .insert(activities);

        if (activitiesError) {
          console.error('Error saving activities:', activitiesError);
          throw activitiesError;
        }
      }
      
      // Generate AI schedule using the edge function
      const { data: aiSchedule, error: aiError } = await supabase.functions.invoke(
        'generate-weekly-schedule',
        {
          body: { schedule: scheduleData }
        }
      );

      if (aiError) {
        console.error('Error generating AI schedule:', aiError);
        throw aiError;
      }

      // Update the schedule with AI-generated content
      const { error: updateError } = await supabase
        .from("weekly_schedules")
        .update({
          notes: aiSchedule.schedule,
          status: 'generated' // Update status to 'generated' after AI processing
        })
        .eq('id', scheduleRecord.id);

      if (updateError) {
        console.error('Error updating schedule with AI content:', updateError);
        throw updateError;
      }
      
    } catch (error) {
      console.error("Error saving schedule:", error);
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