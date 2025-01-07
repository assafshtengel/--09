import { Action } from "@/components/ActionSelector";
import { Progress } from "@/components/ui/progress";

interface GoalsComparisonProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
  }>;
}

export const GoalsComparison = ({ actions, actionLogs }: GoalsComparisonProps) => {
  const calculateStats = (action: Action) => {
    const actionAttempts = actionLogs.filter(log => log.actionId === action.id);
    const totalAttempts = actionAttempts.length;
    const successfulAttempts = actionAttempts.filter(log => log.result === "success").length;
    const goalTarget = action.goal ? parseInt(action.goal) : totalAttempts;
    const completionRate = totalAttempts > 0 ? (totalAttempts / goalTarget) * 100 : 0;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    return {
      totalAttempts,
      successfulAttempts,
      goalTarget,
      completionRate: Math.min(completionRate, 100),
      successRate
    };
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-right">השוואת יעדים וביצועים</h3>
      <div className="space-y-6">
        {actions.map(action => {
          const stats = calculateStats(action);
          return (
            <div key={action.id} className="space-y-2 border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {stats.successfulAttempts}/{stats.totalAttempts} הצלחות
                </span>
                <span className="font-medium">{action.name}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>ביצוע מול יעד</span>
                  <span>{stats.totalAttempts}/{stats.goalTarget} פעולות</span>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>אחוז הצלחה</span>
                  <span>{stats.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={stats.successRate} className="h-2" />
              </div>

              {action.goal && (
                <p className="text-sm text-muted-foreground text-right mt-2">
                  יעד מקורי: {action.goal} פעולות
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};