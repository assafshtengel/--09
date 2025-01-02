import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GamePreview } from "./GamePreview";
import { GameSummary } from "./GameSummary";
import { GameHeader } from "./mobile/GameHeader";
import { GameControls } from "./mobile/GameControls";
import { GameActionsSection } from "./GameActionsSection";
import { Action } from "@/components/ActionSelector";
import { GamePhase, PreMatchReportActions } from "@/types/game";

interface GameContentProps {
  gamePhase: GamePhase;
  isTimerRunning: boolean;
  minute: number;
  onMinuteChange: (minute: number) => void;
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    minute: number;
    result: "success" | "failure";
    note?: string;
  }>;
  generalNotes: Array<{ text: string; minute: number }>;
  showSummary: boolean;
  setShowSummary: (show: boolean) => void;
  matchId: string;
  matchData: {
    pre_match_reports?: {
      actions?: PreMatchReportActions[] | null;
      havaya?: string | null;
      questions_answers?: Record<string, any> | null;
    } | null;
  } | null;
  onStartMatch: () => void;
  onEndHalf: () => void;
  onStartSecondHalf: () => void;
  onEndMatch: () => void;
}

export const GameContent = ({
  gamePhase,
  isTimerRunning,
  minute,
  onMinuteChange,
  actions,
  actionLogs,
  generalNotes,
  showSummary,
  setShowSummary,
  matchId,
  matchData,
  onStartMatch,
  onEndHalf,
  onStartSecondHalf,
  onEndMatch,
}: GameContentProps) => {
  return (
    <>
      {gamePhase !== "preview" && (
        <GameHeader
          isTimerRunning={isTimerRunning}
          minute={minute}
          onMinuteChange={onMinuteChange}
          actions={actions}
          actionLogs={actionLogs}
        />
      )}

      {gamePhase === "preview" && matchData?.pre_match_reports && (
        <GamePreview
          actions={actions}
          havaya={matchData.pre_match_reports.havaya?.split(',') || []}
          preMatchAnswers={matchData.pre_match_reports.questions_answers || {}}
          onStartMatch={onStartMatch}
        />
      )}

      {(gamePhase === "playing" || gamePhase === "secondHalf") && (
        <div className="h-[calc(100vh-180px)] overflow-y-auto">
          <GameActionsSection
            actions={actions}
            actionLogs={actionLogs}
            minute={minute}
            matchId={matchId}
          />
        </div>
      )}

      <GameControls
        gamePhase={gamePhase}
        onStartMatch={onStartMatch}
        onEndHalf={onEndHalf}
        onStartSecondHalf={onStartSecondHalf}
        onEndMatch={onEndMatch}
      />

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-md mx-auto">
          <GameSummary
            actions={actions}
            actionLogs={actionLogs}
            generalNotes={generalNotes}
            onClose={() => setShowSummary(false)}
            gamePhase={gamePhase === "halftime" ? "halftime" : "ended"}
            havaya={matchData?.pre_match_reports?.havaya?.split(',') || []}
            onContinue={gamePhase === "halftime" ? startSecondHalf : undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};