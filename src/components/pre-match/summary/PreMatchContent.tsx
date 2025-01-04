import { ScrollArea } from "@/components/ui/scroll-area";

interface PreMatchContentProps {
  havaya: string;
  actions: Array<{ name: string; goal?: string }>;
  answers: Record<string, string>;
}

export const PreMatchContent = ({ havaya, actions, answers }: PreMatchContentProps) => {
  return (
    <>
      {havaya && (
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-right">הוויה נבחרת</h3>
          <p className="text-xl font-bold text-right">{havaya}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2 text-right">פעולות ({actions.length})</h3>
        <ScrollArea className="h-[200px]">
          <ul className="space-y-2">
            {actions.map((action, index) => (
              <li key={index} className="border p-2 rounded text-right">
                {action.name}
                {action.goal && <div className="text-sm text-muted-foreground">יעד: {action.goal}</div>}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-right">תשובות לשאלות</h3>
        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {Object.entries(answers).map(([question, answer], index) => (
              <div key={index} className="border p-3 rounded">
                <p className="font-medium text-right">{question}</p>
                <p className="text-muted-foreground text-right">{answer}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};