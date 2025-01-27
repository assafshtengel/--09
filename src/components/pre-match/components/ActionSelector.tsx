import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <div className="space-y-8">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-right text-primary mb-6 bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg"
      >
        בחר את הפעולות שלך למשחק
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "p-6 cursor-pointer transition-all duration-300",
                "hover:shadow-lg hover:scale-[1.02] transform",
                "bg-gradient-to-br from-white to-gray-50",
                selectedActions.includes(action)
                  ? "border-2 border-primary/50 bg-primary/5 shadow-md"
                  : "hover:border-primary/30"
              )}
              onClick={() => handleActionToggle(action)}
            >
              <div className="space-y-4 text-right">
                <h3 className="text-lg font-medium bg-gradient-to-r from-primary/10 to-transparent inline-block px-3 py-1 rounded-lg">
                  {action.name}
                </h3>
                {selectedActions.includes(action) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-3 mt-4 justify-end"
                  >
                    <span className="text-base text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-lg">
                      יעד לביצוע
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={action.goal || ""}
                      onChange={(e) => handleGoalChange(action.id, e.target.value)}
                      className="w-24 p-2 text-base border rounded-lg text-right bg-white/80 
                               focus:ring-2 focus:ring-primary/20 focus:border-primary/30 
                               transition-all duration-200"
                      placeholder="יעד"
                    />
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};