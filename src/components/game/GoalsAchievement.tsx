import { Action } from "@/components/ActionSelector";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface GoalsAchievementProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
  }>;
}

export const GoalsAchievement = ({ actions, actionLogs }: GoalsAchievementProps) => {
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  
  const calculateAchievement = (action: Action) => {
    const logs = actionLogs.filter(log => log.actionId === action.id);
    const successes = logs.filter(log => log.result === "success").length;
    const total = logs.length || 1; // Prevent division by zero
    const successRate = (successes / total) * 100;
    
    return {
      successRate,
      ratio: `${successes}/${total}`
    };
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-right mb-6">סטטיסטיקות משחק</h3>
      
      {/* Progress Bars Section */}
      <div className="space-y-4 mb-8">
        {actions.map(action => {
          const { successRate, ratio } = calculateAchievement(action);
          return (
            <div key={action.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{ratio}</span>
                <span className="font-medium">{action.name}</span>
              </div>
              <Progress value={successRate} className="h-2" />
            </div>
          );
        })}
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-4">
        {actions.map(action => (
          <div key={action.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0 border-red-200 hover:bg-red-50"
                  onClick={() => setSelectedActionId(action.id)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-10 h-10 p-0 border-green-200 hover:bg-green-50"
                  onClick={() => setSelectedActionId(action.id)}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
              </div>
              <span className="font-medium text-right">{action.name}</span>
            </div>
            {selectedActionId === action.id && (
              <textarea
                className="w-full p-2 text-sm border rounded-lg resize-none text-right"
                placeholder="הוסף הערה..."
                rows={2}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};