import { Action } from "../ActionSelector";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface ActionListProps {
  actions: Action[];
  onActionToggle: (actionId: string) => void;
  onGoalChange: (actionId: string, goal: string) => void;
}

export const ActionList = ({ actions, onActionToggle, onGoalChange }: ActionListProps) => {
  return (
    <div className="space-y-4">
      {actions.map(action => (
        <div key={action.id} className="flex flex-col space-y-2 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Checkbox
              id={action.id}
              checked={action.isSelected}
              onCheckedChange={() => onActionToggle(action.id)}
            />
            <label htmlFor={action.id} className="text-right flex-grow mr-2">
              {action.name}
            </label>
          </div>
          
          {action.isSelected && (
            <div className="mt-2">
              <Input
                type="text"
                value={action.goal || ""}
                onChange={(e) => onGoalChange(action.id, e.target.value)}
                placeholder="הגדר יעד (לדוגמה: 5 הצלחות)"
                className="text-right"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};