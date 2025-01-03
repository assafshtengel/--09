import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Action } from "@/components/ActionSelector";
import { GamePreview } from "./game/GamePreview";
import { GameSummary } from "./game/GameSummary";
import { GameHeader } from "./game/mobile/GameHeader";
import { GameControls } from "./game/mobile/GameControls";
import { ActionButtons } from "./game/mobile/ActionButtons";
import { GameNotes } from "./game/GameNotes";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { PreMatchReportActions } from "@/types/game";
import { useGameState } from "./game/GameStateManager";
import { useGameData } from "./game/GameDataManager";

export const GameTracker = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showSummary, setShowSummary] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [generalNote, setGeneralNote] = useState("");

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
    saveNote,
    saveSubstitution
  } = useGameData(matchId);

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  const loadMatchData = async () => {
    if (!matchId) return;

    try {
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(`
          *,
          pre_match_reports (
            actions
          )
        `)
        .eq("id", matchId)
        .maybeSingle();

      if (matchError) throw matchError;

      if (match?.pre_match_reports?.actions) {
        const rawActions = match.pre_match_reports.actions as unknown;
        const preMatchActions = rawActions as PreMatchReportActions[];
        
        const validActions = preMatchActions
          .filter(action => 
            typeof action === 'object' && 
            action !== null && 
            'id' in action && 
            'name' in action && 
            'isSelected' in action
          )
          .map(action => ({
            id: action.id,
            name: action.name,
            goal: action.goal,
            isSelected: action.isSelected
          }));
          
        setActions(validActions);
      }
    } catch (error) {
      console.error("Error loading match data:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני המשחק",
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
    setGeneralNote("");
  };

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

  const logAction = async (actionId: string, result: "success" | "failure", note?: string) => {
    await saveActionLog(actionId, result, minute, note);

    toast({
      title: result === "success" ? "פעולה הצליחה" : "פעולה נכשלה",
      className: result === "success" ? "bg-green-500" : "bg-red-500",
      duration: 1000,
    });
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