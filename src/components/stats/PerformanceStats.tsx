import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export const PerformanceStats = () => {
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('match_actions')
        .select(`
          *,
          matches (
            match_date
          )
        `)
        .eq('player_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const processedData = processPerformanceData(data);
      setPerformanceData(processedData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPerformanceData = (data: any[]) => {
    // Group by date and calculate success rate
    const groupedData = data.reduce((acc, curr) => {
      const date = new Date(curr.matches.match_date).toLocaleDateString('he-IL');
      if (!acc[date]) {
        acc[date] = { success: 0, total: 0 };
      }
      acc[date].total++;
      if (curr.result === 'success') {
        acc[date].success++;
      }
      return acc;
    }, {});

    return Object.entries(groupedData).map(([date, stats]: [string, any]) => ({
      date,
      successRate: Math.round((stats.success / stats.total) * 100)
    }));
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>התקדמות לאורך זמן</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  stroke="#8884d8"
                  name="אחוז הצלחה"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>סטטיסטיקות אחרונות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.slice(-3).map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{data.successRate}%</span>
                  <span>{data.date}</span>
                </div>
                <Progress value={data.successRate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};