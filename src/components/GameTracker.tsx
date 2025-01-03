import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GamePreview } from "./game/GamePreview";
import { GameSummary } from "./game/GameSummary";
import { GameHeader } from "./game/mobile/GameHeader";
import { GameControls } from "./game/mobile/GameControls";
import { ActionButtons } from "./game/mobile/ActionButtons";
import { GameNotes } from "./game/GameNotes";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { useGameState } from "./game/GameStateManager";
import { useGameData } from "./game/GameDataManager";
import { useGameActions } from "./game/hooks/useGameActions";
import { useGameNotes } from "./game/hooks/useGameNotes";

export const GameTracker = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const [showSummary, setShowSummary] = useState(false);

  const {
    gamePhase,
    minute,
    isTimerRunning,
    setMinute,
    startMatch,
    endHalf,
    startSecondHalf,
    endMatch
  } = useGameState(matchId);

  const {
    actionLogs,
    generalNotes,
    substitutions,
    saveActionLog,
    saveSubstitution
  } = useGameData(matchId);

  const {
    actions,
    loadMatchActions,
    handleAddAction
  } = useGameActions(matchId);

  const {
    generalNote,
    setGeneralNote,
    handleAddGeneralNote
  } = useGameNotes(matchId);

  useEffect(() => {
    loadMatchActions();
  }, [matchId]);

  const handlePlayerExit = async (playerName: string, canReturn: boolean) => {
    const sub = {
      playerIn: "",
      playerOut: playerName,
      minute
    };

    await saveSubstitution(sub);

    if (!canReturn) {
      endMatch();
    }
  };

  const handlePlayerReturn = async (playerName: string) => {
    const sub = {
      playerIn: playerName,
      playerOut: "",
      minute
    };

    await saveSubstitution(sub);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-24 md:pb-0">
        {gamePhase !== "preview" && (
          <GameHeader
            isTimerRunning={isTimerRunning}
            minute={minute}
            onMinuteChange={setMinute}
            actions={actions}
            actionLogs={actionLogs}
          />
        )}

        {gamePhase === "preview" && (
          <GamePreview
            actions={actions}
            onActionAdd={handleAddAction}
            onStartMatch={startMatch}
          />
        )}

        {(gamePhase === "playing" || gamePhase === "secondHalf") && (
          <div className="space-y-6 p-4">
            <div className="grid gap-6">
              {actions.map(action => (
                <div key={action.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{action.name}</span>
                    <ActionButtons
                      actionId={action.id}
                      onLog={saveActionLog}
                    />
                  </div>
                </div>
              ))}
            </div>

            <GameNotes
              generalNote={generalNote}
              onNoteChange={setGeneralNote}
              onAddNote={() => handleAddGeneralNote(minute)}
            />

            <PlayerSubstitution
              minute={minute}
              onPlayerExit={handlePlayerExit}
              onPlayerReturn={handlePlayerReturn}
            />
          </div>
        )}

        <GameControls
          gamePhase={gamePhase}
          onStartMatch={startMatch}
          onEndHalf={endHalf}
          onStartSecondHalf={startSecondHalf}
          onEndMatch={endMatch}
        />

        <Dialog open={showSummary} onOpenChange={setShowSummary}>
          <DialogContent className="max-w-md mx-auto">
            <GameSummary
              actions={actions}
              actionLogs={actionLogs}
              generalNotes={generalNotes}
              substitutions={substitutions}
              onClose={() => setShowSummary(false)}
              gamePhase={gamePhase === "halftime" || gamePhase === "ended" ? gamePhase : "ended"}
              matchId={matchId}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};