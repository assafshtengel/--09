import { Action } from "@/components/ActionSelector";

interface ActionsSummarySectionProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    minute: number;
    result: "success" | "failure";
    note?: string;
  }>;
}

export const ActionsSummarySection = ({ actions, actionLogs }: ActionsSummarySectionProps) => {
  const getActionName = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    return action ? action.name : actionId;
  };

  const calculateSuccessRate = (actionId: string) => {
    const actionAttempts = actionLogs.filter(log => log.actionId === actionId);
    if (actionAttempts.length === 0) return 0;
    
    const successfulAttempts = actionAttempts.filter(log => log.result === "success");
    return Math.round((successfulAttempts.length / actionAttempts.length) * 100);
  };

  return (
    <div data-section="actions-summary" className="border p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-right">סיכום פעולות</h3>
      <div className="space-y-4">
        {actions.map(action => {
          const attempts = actionLogs.filter(log => log.actionId === action.id);
          const successRate = calculateSuccessRate(action.id);
          
          return (
            <div key={action.id} className="border-b pb-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{successRate}% הצלחה</span>
                <h4 className="font-medium">{action.name}</h4>
              </div>
              <p className="text-sm text-right mt-1">
                סה"כ ניסיונות: {attempts.length}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};