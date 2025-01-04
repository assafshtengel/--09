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
    const failureCount = actionAttempts.filter(log => log.result === "failure").length;
    const totalAttempts = actionAttempts.length;
    const successRate = totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0;

    return {
      successCount,
      failureCount,
      totalAttempts,
      successRate,
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
            <div key={action.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {stats.successCount}/{stats.totalAttempts} הצלחות
                </span>
                <span className="font-medium">{action.name}</span>
              </div>
              
              <Progress value={stats.successRate} className="h-2" />
              
              {action.goal && (
                <div className="text-sm text-right text-muted-foreground mt-2">
                  <span className="font-medium">יעד: </span>
                  {action.goal}
                </div>
              )}
              
              <div className="text-sm text-right">
                <span className="text-green-600">{stats.successCount} הצלחות</span>
                {" | "}
                <span className="text-red-600">{stats.failureCount} כשלונות</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};