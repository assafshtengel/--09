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
    
    // If there's a goal set, use it, otherwise use total attempts as the target
    const goalTarget = action.goal ? parseInt(action.goal) : totalAttempts || 1;
    
    // Calculate completion rate (total attempts / goal) - cap at 100%
    const completionRate = Math.min((totalAttempts / goalTarget) * 100, 100);
    
    // Calculate success rate (successful / total attempts)
    // If no attempts, return 0
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    return {
      totalAttempts,
      successfulAttempts,
      goalTarget,
      completionRate,
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
                  <span dir="ltr">{stats.totalAttempts}/{stats.goalTarget}</span>
                </div>
                <Progress 
                  value={stats.completionRate} 
                  className="h-2"
                />
                <div className="text-sm text-right text-muted-foreground">
                  {stats.completionRate.toFixed(1)}% הושלמו
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>אחוז הצלחה</span>
                  <span dir="ltr">{stats.successRate.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={stats.successRate} 
                  className="h-2"
                />
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