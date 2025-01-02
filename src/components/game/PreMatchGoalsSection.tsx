import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreMatchReport } from "@/types/game";

interface PreMatchGoalsSectionProps {
  preMatchData: PreMatchReport;
}

export const PreMatchGoalsSection = ({ preMatchData }: PreMatchGoalsSectionProps) => {
  if (!preMatchData) return null;

  // Split havaya string by commas if it exists, otherwise return empty array
  const havayaArray = preMatchData.havaya ? preMatchData.havaya.split(',').map(h => h.trim()) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">מטרות טרום משחק</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {preMatchData.actions && preMatchData.actions.length > 0 && (
          <div>
            <h4 className="font-semibold text-right mb-2">פעולות שנבחרו</h4>
            <div className="flex flex-wrap gap-2 justify-end">
              {preMatchData.actions
                .filter(action => action.isSelected)
                .map(action => (
                  <Badge key={action.id} variant="secondary">
                    {action.name}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {havayaArray.length > 0 && (
          <div>
            <h4 className="font-semibold text-right mb-2">הוויות נבחרות</h4>
            <div className="flex flex-wrap gap-2 justify-end">
              {havayaArray.map((h: string, index: number) => (
                <Badge key={index} variant="outline">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};