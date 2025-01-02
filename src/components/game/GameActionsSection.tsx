import { Action } from "@/components/ActionSelector";
import { GameActionsList } from "./GameActionsList";
import { GameNoteManager } from "./GameNoteManager";
import { GameSubstitutionManager } from "./GameSubstitutionManager";
import { useActionManager } from "./hooks/useActionManager";
import { useState, useEffect } from "react";

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
  onActionUpdate?: () => void;
}

export const GameActionsSection = ({
  actions,
  actionLogs,
  minute,
  matchId,
  onActionUpdate,
}: GameActionsSectionProps) => {
  const [localActionLogs, setLocalActionLogs] = useState(actionLogs);
  const { handleActionLog } = useActionManager(matchId, minute, actions, onActionUpdate);

  useEffect(() => {
    setLocalActionLogs(actionLogs);
  }, [actionLogs]);

  const handleLog = async (actionId: string, result: "success" | "failure", note?: string) => {
    await handleActionLog(actionId, result, note);
    
    // Update local state immediately
    setLocalActionLogs(prev => [
      ...prev,
      {
        actionId,
        minute,
        result,
        note
      }
    ]);
    
    // Notify parent component
    if (onActionUpdate) {
      onActionUpdate();
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid gap-4">
        {actions.map(action => (
          <GameActionsList
            key={action.id}
            actions={[action]}
            actionLogs={localActionLogs.filter(log => log.actionId === action.id)}
            onLog={handleLog}
            matchId={matchId}
            minute={minute}
          />
        ))}
      </div>

      <GameNoteManager matchId={matchId} minute={minute} />
      <GameSubstitutionManager matchId={matchId} minute={minute} />
    </div>
  );
};