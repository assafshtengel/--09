import { Json } from "@/integrations/supabase/types";
import { ActionList } from "./actions/ActionList";
import { CustomActionInput } from "./actions/CustomActionInput";
import { useActions } from "./actions/useActions";

export interface Action {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
}

interface ActionSelectorProps {
  position: string;
  onSubmit: (actions: Json) => void;
}

export const ActionSelector = ({ position, onSubmit }: ActionSelectorProps) => {
  const {
    actions,
    customAction,
    setCustomAction,
    handleActionToggle,
    handleGoalChange,
    addCustomAction
  } = useActions(position);

  return (
    <form className="space-y-6 w-full max-w-xl mx-auto p-6">
      <div className="space-y-4">
        <div className="text-right">
          <h2 className="text-xl font-semibold mb-2">בחר פעולות למעקב</h2>
          <p className="text-sm text-gray-600">
            רצוי לבחור 5-7 פעולות (3-4 שאתה מרגיש בהם ביטחון ועוד 1-2 שאתה חושש לבצע)
          </p>
        </div>
        
        <ActionList
          actions={actions}
          onActionToggle={handleActionToggle}
          onGoalChange={handleGoalChange}
        />

        <CustomActionInput
          value={customAction}
          onChange={setCustomAction}
          onAdd={addCustomAction}
        />
      </div>
    </form>
  );
};