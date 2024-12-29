import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Goal {
  name: string;
  goal: string;
  progress?: number;
}

export const GoalsProgress = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const { data: preMatchReports } = await supabase
        .from('pre_match_reports')
        .select('actions')
        .order('created_at', { ascending: false })
        .limit(1);

      if (preMatchReports?.[0]?.actions) {
        // Ensure we're working with an array and cast it to our Goal type
        const actionsArray = Array.isArray(preMatchReports[0].actions) 
          ? preMatchReports[0].actions as Goal[]
          : [];
        setGoals(actionsArray);
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
        {goals.map((goal: Goal, index) => (
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