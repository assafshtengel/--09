import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { ActionModal } from "@/components/game/ActionModal";
import { toast } from "@/hooks/use-toast";
import { CircleDot, Goal, Activity, Shield, Target, Swords } from "lucide-react";

interface ActionsListProps {
  actions: Action[];
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
}

const getActionIcon = (index: number) => {
  const icons = [CircleDot, Goal, Activity, Shield, Target, Swords];
  const Icon = icons[index % icons.length];
  return <Icon className="h-6 w-6" />;
};

export const ActionsList = ({ actions, onLog }: ActionsListProps) => {
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const handleActionClick = (action: Action) => {
    setSelectedAction(action);
  };

  const handleActionResult = (result: "success" | "failure") => {
    if (selectedAction) {
      onLog(selectedAction.id, result);
      toast({
        title: result === "success" ? "פעולה הצליחה" : "פעולה נכשלה",
        className: result === "success" ? "bg-green-500" : "bg-red-500",
        duration: 1000,
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 p-4">
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action)}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            {getActionIcon(index)}
            <span className="mt-2 text-sm font-medium text-center">
              {action.name}
            </span>
          </button>
        ))}
      </div>

      <ActionModal
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        actionName={selectedAction?.name || ""}
        onResult={handleActionResult}
      />
    </>
  );
};