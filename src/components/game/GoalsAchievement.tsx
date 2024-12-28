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
    const logs = actionLogs.filter(log => log.actionId === action.id);
    const successes = logs.filter(log => log.result === "success").length;
    const total = logs.length;
    const goal = action.goal ? parseInt(action.goal) : 0;

    return {
      achieved: successes,
      total,
      goal,
      isAchieved: goal > 0 && successes >= goal
    };
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold text-right">השגת יעדים</h3>
      <div className="space-y-2">
        {actions.map(action => {
          const { achieved, total, goal, isAchieved } = calculateAchievement(action);
          
          return (
            <div 
              key={action.id} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isAchieved ? 'text-green-600' : 'text-red-600'}`}>
                  {achieved} / {goal || total}
                </span>
                {goal > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isAchieved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {isAchieved ? 'הושג' : 'לא הושג'}
                  </span>
                )}
              </div>
              <span className="font-medium">{action.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};