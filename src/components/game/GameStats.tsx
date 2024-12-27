import { Action } from "@/components/ActionSelector";
import { Progress } from "@/components/ui/progress";

interface GameStatsProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
  }>;
}

export const GameStats = ({ actions, actionLogs }: GameStatsProps) => {
  const calculateStats = () => {
    const stats = actions.map(action => {
      const actionResults = actionLogs.filter(log => log.actionId === action.id);
      const successes = actionResults.filter(log => log.result === "success").length;
      const total = actionResults.length;
      const successRate = total > 0 ? (successes / total) * 100 : 0;

      return {
        action,
        successes,
        total,
        successRate
      };
    });

    return stats;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background/50 backdrop-blur-sm">
      <h3 className="font-semibold text-right">סטטיסטיקות משחק</h3>
      {calculateStats().map(({ action, successes, total, successRate }) => (
        <div key={action.id} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{successes}/{total}</span>
            <span>{action.name}</span>
          </div>
          <Progress value={successRate} className="h-2" />
        </div>
      ))}
    </div>
  );
};