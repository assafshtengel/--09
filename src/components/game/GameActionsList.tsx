import { Action } from "@/components/ActionSelector";
import { ActionItem } from "./ActionItem";

interface GameActionsListProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
  }>;
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
  matchId: string;
  minute: number;
}

export const GameActionsList = ({ actions, actionLogs, onLog, matchId, minute }: GameActionsListProps) => {
  const calculateStats = (actionId: string) => {
    const results = actionLogs.filter(log => log.actionId === actionId);
    return {
      success: results.filter(log => log.result === "success").length,
      total: results.length
    };
  };

  return (
    <div className="grid gap-3">
      {actions.map(action => (
        <ActionItem
          key={action.id}
          action={action}
          stats={calculateStats(action.id)}
          onLog={onLog}
          matchId={matchId}
          minute={minute}
        />
      ))}
    </div>
  );
};