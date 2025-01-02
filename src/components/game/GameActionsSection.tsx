import { Action } from "@/components/ActionSelector";
import { GameActionsList } from "./GameActionsList";
import { GameNoteManager } from "./GameNoteManager";
import { GameSubstitutionManager } from "./GameSubstitutionManager";
import { useActionManager } from "./hooks/useActionManager";

interface GameActionsSectionProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    minute: number;
    result: "success" | "failure";
    note?: string;
  }>;
  minute: number;
  matchId: string;
}

export const GameActionsSection = ({
  actions,
  actionLogs,
  minute,
  matchId,
}: GameActionsSectionProps) => {
  const { handleActionLog } = useActionManager(matchId, minute, actions);

  const calculateActionStats = (actionId: string) => {
    const actionResults = actionLogs.filter(log => log.actionId === actionId);
    return {
      success: actionResults.filter(log => log.result === "success").length,
      total: actionResults.length
    };
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid gap-4">
        {actions.map(action => (
          <GameActionsList
            key={action.id}
            actions={[action]}
            actionLogs={actionLogs.filter(log => log.actionId === action.id)}
            onLog={handleActionLog}
          />
        ))}
      </div>

      <GameNoteManager matchId={matchId} minute={minute} />
      <GameSubstitutionManager matchId={matchId} minute={minute} />
    </div>
  );
};