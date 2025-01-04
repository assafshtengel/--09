import { Action } from "@/components/ActionSelector";
import { Progress } from "@/components/ui/progress";

interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

interface StatisticsSectionProps {
  actions: Action[];
  actionLogs: ActionLog[];
}

export const StatisticsSection = ({ actions, actionLogs }: StatisticsSectionProps) => {
  const calculateActionStats = (action: Action) => {
    const actionAttempts = actionLogs.filter(log => log.actionId === action.id);
    const successCount = actionAttempts.filter(log => log.result === "success").length;
    const totalAttempts = actionAttempts.length;
    
    return {
      successCount,
      totalAttempts,
      goal: action.goal
    };
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-right">סטטיסטיקות ביצוע</h3>
      <div className="space-y-4">
        {actions.map(action => {
          const stats = calculateActionStats(action);
          return (
            <div key={action.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  {stats.successCount}/{stats.totalAttempts} הצלחות
                </span>
                <span className="font-medium">{action.name}</span>
              </div>
              
              <Progress 
                value={(stats.successCount / Math.max(stats.totalAttempts, 1)) * 100} 
                className="h-2 mb-2" 
              />
              
              <div className="text-sm text-right text-muted-foreground">
                הצלחות {stats.successCount} מתוך {stats.totalAttempts || 0}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};