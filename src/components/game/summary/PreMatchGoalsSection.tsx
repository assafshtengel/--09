import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PreMatchGoalsProps {
  preMatchData: {
    actions: Array<{
      id: string;
      name: string;
      isSelected: boolean;
    }>;
    havaya?: string[];
  };
}

export const PreMatchGoalsSection = ({ preMatchData }: PreMatchGoalsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">מטרות טרום משחק</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {preMatchData.actions.length > 0 && (
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

        {preMatchData.havaya && preMatchData.havaya.length > 0 && (
          <div>
            <h4 className="font-semibold text-right mb-2">הוויות נבחרות</h4>
            <div className="flex flex-wrap gap-2 justify-end">
              {preMatchData.havaya.map((h, index) => (
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