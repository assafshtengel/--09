import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";
import { GamePreview } from "./game/GamePreview";
import { GameSummary } from "./game/GameSummary";
import { GameHeader } from "./game/mobile/GameHeader";
import { GameControls } from "./game/mobile/GameControls";
import { ActionButtons } from "./game/mobile/ActionButtons";
import { GameNotes } from "./game/GameNotes";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { useGameState } from "./game/GameState";
import { useGameDataService } from "./game/GameDataService";

export const GameTracker = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const gameState = useGameState();
  const gameDataService = useGameDataService();
  const {
    gamePhase,
    setGamePhase,
    minute,
    setMinute,
    actionLogs,
    setActionLogs,
    showSummary,
    setShowSummary,
    actions,
    setActions,
    generalNote,
    setGeneralNote,
    generalNotes,
    setGeneralNotes,
    substitutions,
    setSubstitutions,
    isTimerRunning,
    setIsTimerRunning,
  } = gameState;

  useEffect(() => {
    if (matchId) {
      loadMatchData();
    }
  }, [matchId]);

  const loadMatchData = async () => {
    if (!matchId) return;

    const data = await gameDataService.loadMatchData(matchId);
    if (data) {
      setActions(data.actions);
      setGamePhase(data.status);
    }
  };

  const handleAddAction = (newAction: Action) => {
    setActions(prev => [...prev, newAction]);
    toast({
      title: "פעולה נוספה",
      description: `הפעולה ${newAction.name} נוספה למעקב`,
    });
  };

  const handleAddGeneralNote = async () => {
    if (!matchId || !generalNote.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין טקסט להערה",
        variant: "destructive",
      });
      return;
    }

    const success = await gameDataService.saveNote(matchId, minute, generalNote);
    if (success) {
      setGeneralNotes(prev => [...prev, { text: generalNote, minute }]);
      setGeneralNote("");
      toast({
        title: "ההערה נשמרה",
        description: "ההערה נשמרה בהצלחה",
      });
    }
  };

  const handlePlayerExit = async (playerName: string, canReturn: boolean) => {
    if (!matchId) return;

    const sub = {
      playerIn: "",
      playerOut: playerName,
      minute
    };

    const success = await gameDataService.saveSubstitution(matchId, sub);
    if (success) {
      setSubstitutions(prev => [...prev, sub]);
      if (!canReturn) {
        endMatch();
      }
    }
  };

  const handlePlayerReturn = async (playerName: string) => {
    if (!matchId) return;

    const sub = {
      playerIn: playerName,
      playerOut: "",
      minute
    };

    const success = await gameDataService.saveSubstitution(matchId, sub);
    if (success) {
      setSubstitutions(prev => [...prev, sub]);
    }
  };

  const startMatch = async () => {
    if (!matchId) return;

    const success = await gameDataService.updateMatchStatus(matchId, "playing");
    if (success) {
      setGamePhase("playing");
      setMinute(0);
      setIsTimerRunning(true);
    }
  };

  const endHalf = async () => {
    if (!matchId) return;

    const success = await gameDataService.updateMatchStatus(matchId, "halftime");
    if (success) {
      setIsTimerRunning(false);
      setGamePhase("halftime");
      setShowSummary(true);
    }
  };

  const startSecondHalf = async () => {
    if (!matchId) return;

    const success = await gameDataService.updateMatchStatus(matchId, "secondHalf");
    if (success) {
      setGamePhase("secondHalf");
      setMinute(45);
      setIsTimerRunning(true);
      setShowSummary(false);
    }
  };

  const endMatch = async () => {
    if (!matchId) return;

    const success = await gameDataService.updateMatchStatus(matchId, "ended");
    if (success) {
      setIsTimerRunning(false);
      setGamePhase("ended");
      setShowSummary(true);
    }
  };

  const logAction = async (action_id: string, result: "success" | "failure", note?: string) => {
    if (!matchId) return;

    const success = await gameDataService.saveActionLog(matchId, action_id, minute, result, note);
    if (success) {
      setActionLogs(prev => [...prev, {
        action_id,
        minute,
        result,
        note
      }]);

      toast({
        title: result === "success" ? "פעולה הצליחה" : "פעולה נכשלה",
        className: result === "success" ? "bg-green-500" : "bg-red-500",
        duration: 1000,
      });
    }
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
                      onLog={logAction}
                    />
                  </div>
                </div>
              ))}
            </div>

            <GameNotes
              generalNote={generalNote}
              onNoteChange={setGeneralNote}
              onAddNote={handleAddGeneralNote}
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