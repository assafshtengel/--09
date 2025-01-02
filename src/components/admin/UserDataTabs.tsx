import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const UserDataTabs = () => {
  const { data: matches } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          *,
          profiles:player_id (full_name),
          pre_match_report:pre_match_report_id (*)
        `)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: trainings } = useQuery({
    queryKey: ['admin-trainings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('training_summaries')
        .select(`
          *,
          profiles:player_id (full_name)
        `)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: schedules } = useQuery({
    queryKey: ['admin-schedules'],
    queryFn: async () => {
      const { data } = await supabase
        .from('weekly_schedules')
        .select(`
          *,
          profiles:player_id (full_name),
          schedule_activities (*)
        `)
        .order('created_at', { ascending: false });
      return data;
    }
  });

  return (
    <Tabs defaultValue="matches" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="matches">משחקים</TabsTrigger>
        <TabsTrigger value="trainings">אימונים</TabsTrigger>
        <TabsTrigger value="schedules">מערכות שעות</TabsTrigger>
      </TabsList>

      <TabsContent value="matches">
        <div className="grid gap-4">
          {matches?.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle>
                  {match.profiles?.full_name} - {match.opponent || 'ללא יריב'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>תאריך: {new Date(match.match_date).toLocaleDateString('he-IL')}</p>
                <p>סטטוס: {match.status}</p>
                {match.final_score && <p>תוצאה סופית: {match.final_score}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="trainings">
        <div className="grid gap-4">
          {trainings?.map((training) => (
            <Card key={training.id}>
              <CardHeader>
                <CardTitle>{training.profiles?.full_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>תאריך: {new Date(training.training_date).toLocaleDateString('he-IL')}</p>
                <p>שעה: {training.training_time}</p>
                <p>דירוג שביעות רצון: {training.satisfaction_rating}/7</p>
                <p>דירוג אנרגיה ומיקוד: {training.energy_focus_rating}/7</p>
                <p>דירוג התמודדות עם אתגרים: {training.challenge_handling_rating}/7</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="schedules">
        <div className="grid gap-4">
          {schedules?.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <CardTitle>{schedule.profiles?.full_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>תאריך התחלה: {new Date(schedule.start_date).toLocaleDateString('he-IL')}</p>
                <p>מספר פעילויות: {schedule.schedule_activities?.length || 0}</p>
                <p>סטטוס: {schedule.is_active ? 'פעיל' : 'לא פעיל'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};