import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";
import { GamePreview } from "./game/GamePreview";
import { GameSummary } from "./game/GameSummary";
import { GameLayout } from "./game/mobile/GameLayout";
import { ActionsList } from "./game/mobile/ActionsList";
import { GameNotes } from "./game/GameNotes";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { HalftimeSummary } from "./game/HalftimeSummary";
import { ObserverSelectionDialog } from "./game/ObserverSelectionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GamePhase } from "@/types/game";
import { useMatchData } from "./game/hooks/useMatchData";
import { useMatchActions } from "./game/hooks/useMatchActions";

export const GameTracker = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [gamePhase, setGamePhase] = useState<GamePhase>("preview");
  const [showObserverDialog, setShowObserverDialog] = useState(true);
  const [minute, setMinute] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [generalNote, setGeneralNote] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const {
    matchDetails,
    setMatchDetails,
    actionLogs,
    setActionLogs,
    generalNotes,
    setGeneralNotes,
    substitutions,
    setSubstitutions,
    actions,
    setActions,
    loadMatchData,
  } = useMatchData(matchId);

  const {
    saveActionLog,
    saveNote,
    saveSubstitution,
    updateMatchStatus,
  } = useMatchActions(matchId);

  const handleObserverSelect = async (type: "parent" | "player") => {
    if (!matchId) return;

    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: type === "parent" ? "playing" : "preview",
          observer_type: type 
        })
        .eq('id', matchId);

      if (error) throw error;

      setMatchDetails(prev => ({
        ...prev,
        observer_type: type,
        status: type === "parent" ? "playing" : "preview"
      }));
      
      setShowObserverDialog(false);

      if (type === "parent") {
        setGamePhase("playing");
        startMatch();
      }
    } catch (error) {
      console.error('Error updating observer type:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את סוג הצופה",
        variant: "destructive",
      });
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
    if (!generalNote.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין טקסט להערה",
        variant: "destructive",
      });
      return;
    }

    await saveNote(generalNote, minute);
    setGeneralNotes(prev => [...prev, { text: generalNote, minute }]);
    setGeneralNote("");
    toast({
      title: "ההערה נשמרה",
      description: "ההערה נשמרה בהצלחה",
    });
  };

  const handlePlayerExit = async (playerName: string, canReturn: boolean) => {
    await saveSubstitution("", playerName, minute);
    setSubstitutions(prev => [...prev, {
      playerIn: "",
      playerOut: playerName,
      minute
    }]);

    if (!canReturn) {
      endMatch();
    }
  };

  const handlePlayerReturn = async (playerName: string) => {
    await saveSubstitution(playerName, "", minute);
    setSubstitutions(prev => [...prev, {
      playerIn: playerName,
      playerOut: "",
      minute
    }]);
  };

  const startMatch = async () => {
    setGamePhase("playing");
    await updateMatchStatus("playing");
    setMinute(0);
    setIsTimerRunning(true);
  };

  const endHalf = async () => {
    setIsTimerRunning(false);
    setGamePhase("halftime");
    await updateMatchStatus("halftime");
    setShowSummary(true);
  };

  const startSecondHalf = async () => {
    setGamePhase("secondHalf");
    await updateMatchStatus("secondHalf");
    setMinute(45);
    setIsTimerRunning(true);
    setShowSummary(false);
  };

  const endMatch = async () => {
    setIsTimerRunning(false);
    setGamePhase("ended");
    await updateMatchStatus("ended");
    setShowSummary(true);
  };

  const logAction = async (actionId: string, result: "success" | "failure", note?: string) => {
    await saveActionLog(actionId, result, minute, note);
    setActionLogs(prev => [...prev, {
      actionId,
      minute,
      result,
      note
    }]);

    toast({
      title: result === "success" ? "פעולה הצליחה" : "פעולה נכשלה",
      className: result === "success" ? "bg-green-500" : "bg-red-500",
      duration: 1000,
    });
  };

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  return (
    <>
      <ObserverSelectionDialog 
        isOpen={showObserverDialog} 
        onSelect={handleObserverSelect}
      />
      
      <GameLayout
        gamePhase={gamePhase}
        isTimerRunning={isTimerRunning}
        minute={minute}
        onMinuteChange={setMinute}
        actions={actions}
        actionLogs={actionLogs}
        onStartMatch={startMatch}
        onEndHalf={endHalf}
        onStartSecondHalf={startSecondHalf}
        onEndMatch={endMatch}
      >
        {gamePhase === "preview" && (
          <GamePreview
            actions={actions}
            onActionAdd={handleAddAction}
            onStartMatch={startMatch}
          />
        )}

        {(gamePhase === "playing" || gamePhase === "secondHalf") && (
          <div className="h-full flex flex-col">
            <ActionsList
              actions={actions}
              onLog={logAction}
            />
            
            <div className="p-4 space-y-4">
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
          </div>
        )}

        {gamePhase === "halftime" && (
          <HalftimeSummary
            isOpen={showSummary}
            onClose={() => setShowSummary(false)}
            onStartSecondHalf={startSecondHalf}
            actions={actions}
            actionLogs={actionLogs}
          />
        )}

        {gamePhase === "ended" && (
          <Dialog open={showSummary} onOpenChange={setShowSummary}>
            <DialogContent className="max-w-md mx-auto">
              <GameSummary
                actions={actions}
                actionLogs={actionLogs}
                generalNotes={generalNotes}
                substitutions={substitutions}
                onClose={() => setShowSummary(false)}
                gamePhase="ended"
                matchId={matchId}
                opponent={matchDetails.opponent}
              />
            </DialogContent>
          </Dialog>
        )}
      </GameLayout>
    </>
  );
};