import { Action } from "@/components/ActionSelector";

interface GoalsAchievementProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
  }>;
}

export const GoalsAchievement = ({ actions, actionLogs }: GoalsAchievementProps) => {
  const calculateAchievement = (action: Action) => {
    const actionResults = actionLogs.filter(log => log.actionId === action.id);
    const successes = actionResults.filter(log => log.result === "success").length;
    const total = actionResults.length;
    
    if (!action.goal) return null;
    
    // Parse the goal if it's a number
    const goalNumber = parseInt(action.goal);
    if (!isNaN(goalNumber)) {
      return {
        achieved: successes >= goalNumber,
        current: successes,
        target: goalNumber
      };
    }
    
    // For non-numeric goals, just show if there were any successes
    return {
      achieved: successes > 0,
      current: successes,
      target: "הצלחה כלשהי"
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-right mb-4">מטרות ויעדים</h3>
      <div className="grid gap-3">
        {actions.filter(action => action.goal).map((action, index) => {
          const achievement = calculateAchievement(action);
          if (!achievement) return null;

          return (
            <div key={index} className="border p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div className={`px-2 py-1 rounded ${achievement.achieved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {achievement.achieved ? 'הושג' : 'לא הושג'}
                </div>
                <h4 className="font-medium">{action.name}</h4>
              </div>
              <div className="mt-2 text-sm text-right text-gray-600">
                <p>יעד: {action.goal}</p>
                <p>הושג: {achievement.current} / {achievement.target}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};