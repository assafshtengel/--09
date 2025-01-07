import { useEffect, useState } from "react";
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
  const [data, setData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const { data: matchActions, error } = await supabase
          .from("match_actions")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching match actions:", error);
          return;
        }

        // Process the data to calculate success rates by date
        const processedData = matchActions.reduce((acc: Record<string, { success: number; total: number }>, action) => {
          const date = new Date(action.created_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = { success: 0, total: 0 };
          }
          acc[date].total += 1;
          if (action.result === "success") {
            acc[date].success += 1;
          }
          return acc;
        }, {});

        // Convert to array format for the chart
        const chartData = Object.entries(processedData).map(([date, stats]) => ({
          date,
          successRate: Math.round((stats.success / stats.total) * 100),
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error processing performance data:", error);
      }
    };

    fetchPerformanceData();
  }, []);

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
              <Line type="monotone" dataKey="successRate" stroke="#ea384c" name="אחוז הצלחה" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};