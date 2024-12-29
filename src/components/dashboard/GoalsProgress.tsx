import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const GoalsProgress = () => {
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const { data: preMatchReports } = await supabase
        .from('pre_match_reports')
        .select('actions')
        .order('created_at', { ascending: false })
        .limit(1);

      if (preMatchReports?.[0]?.actions) {
        setGoals(preMatchReports[0].actions);
      }
    };

    fetchGoals();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>התקדמות ליעדים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal: any, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{goal.goal}</span>
              <span>{goal.name}</span>
            </div>
            <Progress value={Math.random() * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};