import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface MatchAction {
  action_id: string;
  result: 'success' | 'failure';
}

interface Match {
  id: string;
  match_actions: MatchAction[];
}

export const StatsOverview = () => {
  const [stats, setStats] = useState({
    totalMatches: 0,
    successRate: 0,
    totalActions: 0
  });

  const [actionDistribution, setActionDistribution] = useState<Array<{name: string, value: number}>>([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id,
          match_actions (
            action_id,
            result
          )
        `)
        .eq('player_id', user.id);

      if (matches) {
        const totalMatches = matches.length;
        let successfulActions = 0;
        let totalActions = 0;

        const actionCounts: Record<string, number> = {};

        matches.forEach((match: Match) => {
          match.match_actions?.forEach((action: MatchAction) => {
            totalActions++;
            if (action.result === 'success') {
              successfulActions++;
            }
            actionCounts[action.action_id] = (actionCounts[action.action_id] || 0) + 1;
          });
        });

        const distribution = Object.entries(actionCounts).map(([name, value]) => ({
          name,
          value
        }));

        setStats({
          totalMatches,
          successRate: Math.round((successfulActions / totalActions) * 100) || 0,
          totalActions
        });

        setActionDistribution(distribution);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>סטטיסטיקות כלליות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <div className="text-sm text-muted-foreground">משחקים</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <div className="text-sm text-muted-foreground">הצלחה</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalActions}</div>
              <div className="text-sm text-muted-foreground">פעולות</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>התפלגות פעולות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};