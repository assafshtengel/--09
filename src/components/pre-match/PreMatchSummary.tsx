import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";

interface PreMatchSummaryProps {
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
  };
  actions: Action[];
  answers: Record<string, string>;
  havaya: string[];
  aiInsights: string[];
  onFinish: () => void;
}

export const PreMatchSummary = ({
  matchDetails,
  actions,
  answers,
  havaya,
  aiInsights,
  onFinish,
}: PreMatchSummaryProps) => {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">סיכום דוח טרום משחק</h2>
        <p className="text-muted-foreground">
          תאריך: {matchDetails.date}
          {matchDetails.opponent && ` | נגד: ${matchDetails.opponent}`}
        </p>
      </div>

      {havaya.length > 0 && (
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">הוויות נבחרות</h3>
          <div className="flex flex-wrap gap-2">
            {havaya.map((h, index) => (
              <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">יעדים למשחק</h3>
        <ul className="space-y-2">
          {actions.map((action, index) => (
            <li key={index} className="border p-2 rounded">
              {action.name}
              {action.goal && <div className="text-sm">יעד: {action.goal}</div>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">תשובות לשאלות</h3>
        <div className="space-y-4">
          {Object.entries(answers).map(([question, answer], index) => (
            <div key={index} className="border p-3 rounded">
              <p className="font-medium">{question}</p>
              <p className="text-muted-foreground">{answer}</p>
            </div>
          ))}
        </div>
      </div>

      {aiInsights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">תובנות AI</h3>
          <ul className="space-y-2">
            {aiInsights.map((insight, index) => (
              <li key={index} className="text-muted-foreground">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onFinish}>סיים</Button>
      </div>
    </div>
  );
};