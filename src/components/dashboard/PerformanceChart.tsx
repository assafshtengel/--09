import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceData {
  date: string;
  successRate: number;
}

export const PerformanceChart = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ['matchActions'],
    queryFn: async () => {
      const { data: matchActions, error } = await supabase
        .from("match_actions")
        .select(`
          *,
          matches (
            match_date
          )
        `)
        .order('match_date', { foreignTable: 'matches', ascending: true });

      if (error) throw error;

      const processedData = matchActions.reduce((acc: Record<string, { success: number, total: number }>, action: any) => {
        const date = new Date(action.matches.match_date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { success: 0, total: 0 };
        }
        acc[date].total += 1;
        if (action.result === "success") {
          acc[date].success += 1;
        }
        return acc;
      }, {});

      return Object.entries(processedData).map(([date, stats]) => ({
        date,
        successRate: Math.round((stats.success / stats.total) * 100),
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ביצועים לאורך זמן</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ביצועים לאורך זמן</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="successRate" 
                stroke="#ea384c" 
                name="אחוז הצלחה"
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};