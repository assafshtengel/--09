import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GameContent } from "./game/GameContent";
import { useGameState } from "./game/hooks/useGameState";
import { useMatchData } from "./game/hooks/useMatchData";

interface GameTrackerProps {
  matchId: string;
}

export const GameTracker = ({ matchId }: GameTrackerProps) => {
  const {
    gamePhase,
    minute,
    setMinute,
    actionLogs,
    setActionLogs,
    showSummary,
    setShowSummary,
    actions,
    setActions,
    generalNotes,
    isTimerRunning,
    startMatch,
    endHalf,
    startSecondHalf,
    endMatch
  } = useGameState(matchId);

  const { matchData, loadMatchData, loadActionLogs } = useMatchData(matchId);

  useEffect(() => {
    const initializeData = async () => {
      const actions = await loadMatchData();
      const logs = await loadActionLogs();
      if (actions) setActions(actions);
      if (logs) setActionLogs(logs);
    };

    initializeData();
  }, [matchId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-24 md:pb-0">
        <GameContent
          gamePhase={gamePhase}
          isTimerRunning={isTimerRunning}
          minute={minute}
          onMinuteChange={setMinute}
          actions={actions}
          actionLogs={actionLogs}
          generalNotes={generalNotes}
          showSummary={showSummary}
          setShowSummary={setShowSummary}
          matchId={matchId}
          matchData={matchData}
          onStartMatch={startMatch}
          onEndHalf={endHalf}
          onStartSecondHalf={startSecondHalf}
          onEndMatch={endMatch}
        />
      </div>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-md mx-auto">
          <DialogTitle>
            {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
          </DialogTitle>
          <GameContent
            gamePhase={gamePhase}
            isTimerRunning={isTimerRunning}
            minute={minute}
            onMinuteChange={setMinute}
            actions={actions}
            actionLogs={actionLogs}
            generalNotes={generalNotes}
            showSummary={showSummary}
            setShowSummary={setShowSummary}
            matchId={matchId}
            matchData={matchData}
            onStartMatch={startMatch}
            onEndHalf={endHalf}
            onStartSecondHalf={startSecondHalf}
            onEndMatch={endMatch}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};