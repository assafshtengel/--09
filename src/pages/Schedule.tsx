import { Navigation } from "@/components/Navigation";
import { WeeklyScheduleWizard } from "@/components/schedule/WeeklyScheduleWizard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Schedule() {
  const { data: activities } = useQuery({
    queryKey: ['schedule-activities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: schedule } = await supabase
        .from('weekly_schedules')
        .select('id')
        .eq('player_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!schedule) return [];

      const { data: activities } = await supabase
        .from('schedule_activities')
        .select('*')
        .eq('schedule_id', schedule.id)
        .order('day_of_week', { ascending: true });

      return activities || [];
    }
  });

  return (
    <div>
      <Navigation />
      <WeeklyScheduleWizard />
    </div>
  );
}