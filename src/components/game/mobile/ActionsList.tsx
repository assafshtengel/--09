import { Action } from "@/components/ActionSelector";
import { ActionButtons } from "./ActionButtons";

interface ActionsListProps {
  actions: Action[];
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
}

export const ActionsList = ({ actions, onLog }: ActionsListProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {actions.map(action => (
        <div
          key={action.id}
          className="border rounded-lg p-2 bg-white shadow-sm flex flex-col justify-between"
        >
          <span className="text-sm font-medium mb-2 text-right">{action.name}</span>
          <ActionButtons
            actionId={action.id}
            onLog={onLog}
          />
        </div>
      ))}
    </div>
  );
};