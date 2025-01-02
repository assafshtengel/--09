import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PreMatchReportActions } from "@/types/game";

interface PreMatchGoalsSectionProps {
  preMatchData: {
    actions?: PreMatchReportActions[] | null;
    questions_answers?: Record<string, any> | null;
    havaya?: string | null;
  } | null;
}

export const PreMatchGoalsSection = ({ preMatchData }: PreMatchGoalsSectionProps) => {
  if (!preMatchData) return null;

  const havayaArray = preMatchData.havaya ? preMatchData.havaya.split(',').map(h => h.trim()) : [];

  return (
    <div className="space-y-4 p-4 border-b">
      {preMatchData.actions && preMatchData.actions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-right mb-2">יעדי המשחק</h3>
          <div className="grid gap-2">
            {preMatchData.actions
              .filter(action => action.isSelected)
              .map(action => (
                <div key={action.id} className="border p-2 rounded-lg text-right">
                  <p className="font-medium">{action.name}</p>
                  {action.goal && (
                    <p className="text-sm text-muted-foreground">יעד: {action.goal}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {havayaArray.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-right mb-2">הוויות נבחרות</h3>
          <div className="flex flex-wrap gap-2 justify-end">
            {havayaArray.map((h, index) => (
              <Badge key={index} variant="secondary">
                {h}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {preMatchData.questions_answers && Object.keys(preMatchData.questions_answers).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-right mb-2">שאלות טרום משחק</h3>
          <div className="space-y-2">
            {Object.entries(preMatchData.questions_answers).map(([question, answer], index) => (
              <div key={index} className="text-right">
                <p className="font-medium">{question}</p>
                <p className="text-sm text-muted-foreground">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};