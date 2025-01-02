import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GameContent } from "./game/GameContent";
import { GameMatchDetails } from "./game/GameMatchDetails";
import { useGameState } from "./game/hooks/useGameState";
import { useMatchData } from "./game/hooks/useMatchData";
import { supabase } from "@/integrations/supabase/client";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const actions = await loadMatchData();
        const logs = await loadActionLogs();
        if (actions) setActions(actions);
        if (logs) setActionLogs(logs);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [matchId]);

  useEffect(() => {
    const refreshActionLogs = async () => {
      if (showSummary) {
        const logs = await loadActionLogs();
        if (logs) setActionLogs(logs);
      }
    };

    refreshActionLogs();
  }, [showSummary]);

  const handleCloseSummary = () => {
    setShowSummary(false);
    if (gamePhase === "halftime") {
      startSecondHalf();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">טוען...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-24 md:pb-0">
        <GameMatchDetails matchData={matchData} />
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

      <Dialog open={showSummary} onOpenChange={handleCloseSummary}>
        <DialogContent className="max-w-md mx-auto">
          <DialogTitle>
            {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
          </DialogTitle>
          <DialogDescription>
            סיכום הפעולות והסטטיסטיקות עד כה
          </DialogDescription>
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