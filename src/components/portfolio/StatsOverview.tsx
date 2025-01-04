import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export const StatsOverview = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("player_stats")
        .select("*")
        .eq("player_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setStats(data);
    };

    fetchStats();
  }, []);

  const chartData = stats ? [
    { name: "דקות משחק", value: stats.minutes_played },
    { name: "שערים", value: stats.goals },
    { name: "בישולים", value: stats.assists },
    { name: "בעיטות למסגרת", value: stats.shots_on_target },
    { name: "פעולות הגנתיות", value: stats.defensive_actions },
  ] : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>סטטיסטיקות עונה נוכחית</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.minutes_played || 0}</div>
              <div className="text-sm text-muted-foreground">דקות משחק</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.goals || 0}</div>
              <div className="text-sm text-muted-foreground">שערים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.assists || 0}</div>
              <div className="text-sm text-muted-foreground">בישולים</div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>נתונים פיזיולוגיים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.speed_record || "-"}</div>
              <div className="text-sm text-muted-foreground">מהירות (קמ"ש)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.jump_height || "-"}</div>
              <div className="text-sm text-muted-foreground">גובה קפיצה (ס"מ)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats?.endurance_score || "-"}</div>
              <div className="text-sm text-muted-foreground">ציון סיבולת</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};