import { useState, useEffect } from "react";
import { WeeklyScheduleViewer } from "@/components/schedule/WeeklyScheduleViewer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const WeeklySchedule = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");

        // Get the user's latest schedule
        const { data: latestSchedule, error: scheduleError } = await supabase
          .from('weekly_schedules')
          .select('id')
          .eq('player_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (scheduleError) throw scheduleError;

        if (latestSchedule) {
          // Get the activities for this schedule
          const { data: scheduleActivities, error: activitiesError } = await supabase
            .from('schedule_activities')
            .select('*')
            .eq('schedule_id', latestSchedule.id);

          if (activitiesError) throw activitiesError;

          setActivities(scheduleActivities || []);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        toast.error("שגיאה בטעינת המערכת השבועית");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (isLoading) {
    return <div className="p-4">טוען...</div>;
  }

  return <WeeklyScheduleViewer activities={activities} />;
};