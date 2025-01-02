import { Badge } from "@/components/ui/badge";
import { Action } from "@/components/ActionSelector";

interface SummaryContentProps {
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
  };
  actions: Action[];
  answers: Record<string, string>;
  havaya: string[];
  aiInsights: string[];
}

export const SummaryContent = ({
  matchDetails,
  actions,
  answers,
  havaya,
  aiInsights,
}: SummaryContentProps) => {
  return (
    <div id="pre-match-summary" className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-right">סיכום דוח טרום משחק</h2>
        <p className="text-muted-foreground text-right">
          תאריך: {matchDetails.date}
          {matchDetails.opponent && ` | נגד: ${matchDetails.opponent}`}
        </p>
      </div>

      {havaya.length > 0 && (
        <div className="border p-4 rounded-lg mt-4">
          <h3 className="text-lg font-semibold mb-2 text-right">הוויות נבחרות</h3>
          <div className="flex flex-wrap gap-2 justify-end">
            {havaya.map((h, index) => (
              <Badge key={index} variant="secondary">
                {h}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-right">פעולות למעקב</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <div key={index} className="border p-3 rounded-lg text-right">
              <h4 className="font-semibold">{action.name}</h4>
              {action.goal && (
                <p className="text-sm text-gray-600 mt-1">יעד: {action.goal}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2 text-right">תשובות לשאלות</h3>
        <div className="space-y-4">
          {Object.entries(answers).map(([question, answer], index) => (
            <div key={index} className="border p-3 rounded-lg text-right">
              <p className="font-medium">{question}</p>
              <p className="text-muted-foreground">{answer}</p>
            </div>
          ))}
        </div>
      </div>

      {aiInsights.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-right">תובנות AI</h3>
          <ul className="space-y-2 text-right">
            {aiInsights.map((insight, index) => (
              <li key={index} className="text-muted-foreground">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};