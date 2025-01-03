import { Action } from "@/components/ActionSelector";
import { ActionItem } from "./ActionItem";

interface GameActionsListProps {
  actions: Action[];
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
}

export const GameActionsList = ({ actions, onLog }: GameActionsListProps) => {
  return (
    <div className="grid gap-3">
      {actions.map(action => (
        <ActionItem
          key={action.id}
          action={action}
          onLog={onLog}
        />
      ))}
    </div>
  );
};