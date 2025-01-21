import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AchievementsSectionProps {
  matchId: string;
  onSave: (data: any) => void;
}

export const AchievementsSection = ({ matchId, onSave }: AchievementsSectionProps) => {
  const { toast } = useToast();
  const [goalsScored, setGoalsScored] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);
  const [goalProgress, setGoalProgress] = useState<number>(5);
  const [actionsPerformed, setActionsPerformed] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<string>("");
  const [winner, setWinner] = useState<string>("");
  const [shortTermGoal, setShortTermGoal] = useState<string>("");

  const loadShortTermGoal = async () => {
    try {
      const { data: goals, error } = await supabase
        .from('player_goals')
        .select('short_term_action')
        .eq('goal_type', 'short_term')
        .maybeSingle();

      if (error) throw error;
      if (goals?.short_term_action) {
        setShortTermGoal(goals.short_term_action);
      }
    } catch (error) {
      console.error('Error loading short term goal:', error);
    }
  };

  const handleSave = async () => {
    try {
      const achievementsData = {
        match_stats: {
          goalsScored,
          assists,
          finalScore,
          winner
        },
        goal_progress: {
          shortTermGoal,
          progressRating: goalProgress,
          actionsPerformed
        }
      };

      const { error } = await supabase
        .from('post_game_feedback')
        .upsert({
          match_id: matchId,
          player_id: (await supabase.auth.getUser()).data.user?.id,
          match_stats: achievementsData.match_stats,
          goal_progress: achievementsData.goal_progress
        });

      if (error) throw error;

      onSave(achievementsData);
      toast({
        title: "נשמר בהצלחה",
        description: "הנתונים נשמרו במערכת",
      });
    } catch (error) {
      console.error('Error saving achievements:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הנתונים",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>הישגים ומדדים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>כמה שערים כבשת?</Label>
            <Input
              type="number"
              min="0"
              value={goalsScored}
              onChange={(e) => setGoalsScored(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>כמה בישולים נתת?</Label>
            <Input
              type="number"
              min="0"
              value={assists}
              onChange={(e) => setAssists(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>

          {shortTermGoal && (
            <div className="space-y-2">
              <Label>התקדמות ליעד קצר טווח: {shortTermGoal}</Label>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">דרג את ההתקדמות שלך (1-10)</Label>
                  <Slider
                    value={[goalProgress]}
                    onValueChange={(value) => setGoalProgress(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground text-center mt-1">
                    {goalProgress}
                  </div>
                </div>

                <div>
                  <Label>כמה פעולות ביצעת הקשורות ליעד זה?</Label>
                  <Input
                    type="number"
                    min="0"
                    value={actionsPerformed}
                    onChange={(e) => setActionsPerformed(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label>תוצאה סופית</Label>
            <Input
              value={finalScore}
              onChange={(e) => setFinalScore(e.target.value)}
              placeholder="לדוגמה: 2-1"
              className="mt-1"
            />
          </div>

          <div>
            <Label>איזו קבוצה ניצחה?</Label>
            <Input
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              placeholder="שם הקבוצה המנצחת"
              className="mt-1"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          שמור נתונים
        </Button>
      </CardContent>
    </Card>
  );
};