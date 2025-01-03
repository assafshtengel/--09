import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface PerformanceData {
  date: string;
  value: number;
}

export const PerformanceStats = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('match_date, pre_match_reports(actions)')
          .order('match_date', { ascending: true });

        if (matchError) throw matchError;

        // Transform the data for the chart
        const transformedData = matchData
          .filter(match => match.pre_match_reports?.actions)
          .map(match => ({
            date: match.match_date,
            value: Array.isArray(match.pre_match_reports?.actions) 
              ? match.pre_match_reports.actions.length 
              : 0
          }));

        setPerformanceData(transformedData);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch performance data');
      }
    };

    fetchPerformanceData();
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ביצועים לאורך זמן</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">שגיאה בטעינת הנתונים: {error}</div>
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
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};