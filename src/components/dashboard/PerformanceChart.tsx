import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PerformanceChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          match_actions (
            result
          )
        `)
        .order('match_date', { ascending: true });

      if (matches) {
        const performanceData = matches.map(match => {
          const successCount = match.match_actions?.filter((action: any) => action.result === 'success').length || 0;
          const totalActions = match.match_actions?.length || 1;
          const successRate = (successCount / totalActions) * 100;

          return {
            date: new Date(match.match_date).toLocaleDateString('he-IL'),
            successRate: Math.round(successRate),
          };
        });

        setData(performanceData);
      }
    };

    fetchPerformanceData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>התקדמות ביצועים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="successRate" stroke="#8884d8" name="אחוז הצלחה" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};