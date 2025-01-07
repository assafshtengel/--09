import { GamePhase } from "@/types/game";
import { GamePreview } from "./GamePreview";
import { ObserverSelection } from "./ObserverSelection";
import { ActionsList } from "./mobile/ActionsList";
import { GameNotes } from "./GameNotes";
import { PlayerSubstitution } from "./PlayerSubstitution";
import { HalftimeSummary } from "./HalftimeSummary";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GameSummary } from "./GameSummary";
import { Action, ActionLog, SubstitutionLog } from "@/types/game";

interface GamePhasesProps {
  gamePhase: GamePhase;
  actions: Action[];
  actionLogs: ActionLog[];
  generalNotes: Array<{ text: string; minute: number }>;
  substitutions: SubstitutionLog[];
  showSummary: boolean;
  minute: number;
  matchId?: string;
  opponent?: string;
  onActionAdd: (action: Action) => void;
  onStartMatch: () => void;
  onStartSecondHalf: () => void;
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
  onPlayerExit: (playerName: string, canReturn: boolean) => void;
  onPlayerReturn: (playerName: string) => void;
  onShowSummaryChange: (show: boolean) => void;
  onObserverSelect: (observer: "parent" | "player") => void;
  generalNote: string;
  onNoteChange: (note: string) => void;
  onAddNote: () => void;
}

export const GamePhases = ({
  gamePhase,
  actions,
  actionLogs,
  generalNotes,
  substitutions,
  showSummary,
  minute,
  matchId,
  opponent,
  onActionAdd,
  onStartMatch,
  onStartSecondHalf,
  onLog,
  onPlayerExit,
  onPlayerReturn,
  onShowSummaryChange,
  onObserverSelect,
  generalNote,
  onNoteChange,
  onAddNote,
}: GamePhasesProps) => {
  if (gamePhase === "preview") {
    return (
      <GamePreview
        actions={actions}
        onActionAdd={onActionAdd}
        onStartMatch={() => onObserverSelect("parent")}
      />
    );
  }

  if (gamePhase === "observer_selection") {
    return <ObserverSelection onSelect={onObserverSelect} />;
  }

  if (gamePhase === "playing" || gamePhase === "secondHalf") {
    return (
      <div className="h-full flex flex-col">
        <ActionsList actions={actions} onLog={onLog} />
        <div className="p-4 space-y-4">
          <GameNotes
            generalNote={generalNote}
            onNoteChange={onNoteChange}
            onAddNote={onAddNote}
          />
          <PlayerSubstitution
            minute={minute}
            onPlayerExit={onPlayerExit}
            onPlayerReturn={onPlayerReturn}
          />
        </div>
      </div>
    );
  }

  if (gamePhase === "halftime") {
    return (
      <HalftimeSummary
        isOpen={showSummary}
        onClose={() => onShowSummaryChange(false)}
        onStartSecondHalf={onStartSecondHalf}
        actions={actions}
        actionLogs={actionLogs}
      />
    );
  }

  if (gamePhase === "ended") {
    return (
      <Dialog open={showSummary} onOpenChange={onShowSummaryChange}>
        <DialogContent className="max-w-md mx-auto">
          <GameSummary
            actions={actions}
            actionLogs={actionLogs}
            generalNotes={generalNotes}
            substitutions={substitutions}
            onClose={() => onShowSummaryChange(false)}
            gamePhase="ended"
            matchId={matchId}
            opponent={opponent}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};