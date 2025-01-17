import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface ActionSelectorProps {
  position: string;
  onSubmit: (actions: Action[]) => void;
}

export const ActionSelector = ({ position, onSubmit }: ActionSelectorProps) => {
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);

  const actions: Action[] = [
    { id: "action1", name: "Action 1", goal: "", isSelected: false },
    { id: "action2", name: "Action 2", goal: "", isSelected: false },
    { id: "action3", name: "Action 3", goal: "", isSelected: false },
    { id: "action4", name: "Action 4", goal: "", isSelected: false },
    { id: "action5", name: "Action 5", goal: "", isSelected: false },
    { id: "action6", name: "Action 6", goal: "", isSelected: false },
  ];

  const handleActionToggle = (action: Action) => {
    const updatedActions = selectedActions.includes(action)
      ? selectedActions.filter(a => a.id !== action.id)
      : [...selectedActions, action];
    setSelectedActions(updatedActions);
    onSubmit(updatedActions);
  };

  const handleGoalChange = (actionId: string, value: string) => {
    const updatedActions = selectedActions.map(action => 
      action.id === actionId ? { ...action, goal: value } : action
    );
    setSelectedActions(updatedActions);
    onSubmit(updatedActions);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                action.isSelected
                  ? "border-2 border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleActionToggle(action)}
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-right">{action.name}</h3>
                {action.isSelected && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="1"
                      value={action.goal || ""}
                      onChange={(e) => handleGoalChange(action.id, e.target.value)}
                      className="w-20 p-2 text-sm border rounded-md text-right"
                      placeholder="יעד"
                    />
                    <span className="text-sm text-gray-600">יעד לביצוע</span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
