import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";
import { GameStats } from "./game/GameStats";
import { GameSummary } from "./game/GameSummary";
import { GamePreview } from "./game/GamePreview";
import { GamePhaseManager } from "./game/GamePhaseManager";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { GameTimer } from "./game/GameTimer";
import { HalftimeSummary } from "./game/HalftimeSummary";
import { GoalsAchievement } from "./game/GoalsAchievement";
import { GameActionsList } from "./game/GameActionsList";
import { GameNotes } from "./game/GameNotes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";
type ActionResult = "success" | "failure";

interface ActionLog {
  actionId: string;
  minute: number;
  result: ActionResult;
  note?: string;
}

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

interface PreMatchReportActions {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
}

export const GameTracker = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [gamePhase, setGamePhase] = useState<GamePhase>("preview");
  const [minute, setMinute] = useState(0);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [generalNote, setGeneralNote] = useState("");
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionLog[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
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
          .single();

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

        setGamePhase(match.status as GamePhase);
      } catch (error) {
        console.error("Error loading match data:", error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את נתוני המשחק",
          variant: "destructive",
        });
      }
    };

    loadMatchData();
  }, [matchId]);

  const saveActionLog = async (actionId: string, result: ActionResult, note?: string) => {
    if (!matchId) return;

    try {
      const { error } = await supabase
        .from('match_actions')
        .insert([
          {
            match_id: matchId,
            action_id: actionId,
            minute,
            result,
            note
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving action:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הפעולה",
        variant: "destructive",
      });
    }
  };

  const saveNote = async (note: string) => {
    if (!matchId) return;

    try {
      const { error } = await supabase
        .from('match_notes')
        .insert([
          {
            match_id: matchId,
            minute,
            note
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההערה",
        variant: "destructive",
      });
    }
  };

  const saveSubstitution = async (sub: SubstitutionLog) => {
    if (!matchId) return;

    try {
      const { error } = await supabase
        .from('match_substitutions')
        .insert([
          {
            match_id: matchId,
            minute: sub.minute,
            player_in: sub.playerIn,
            player_out: sub.playerOut
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving substitution:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את החילוף",
        variant: "destructive",
      });
    }
  };

  const updateMatchStatus = async (status: GamePhase) => {
    if (!matchId) return;

    try {
      const { error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating match status:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את סטטוס המשחק",
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

    await saveNote(generalNote);
    setGeneralNotes(prev => [...prev, { text: generalNote, minute }]);
    setGeneralNote("");
    toast({
      title: "הערה נוספה",
      description: "ההערה נשמרה בהצלחה",
    });
  };

  const handlePlayerExit = async (playerName: string, canReturn: boolean) => {
    const sub: SubstitutionLog = {
      playerIn: "",
      playerOut: playerName,
      minute
    };

    await saveSubstitution(sub);
    setSubstitutions(prev => [...prev, sub]);

    if (!canReturn) {
      endMatch();
    }
  };

  const handlePlayerReturn = async (playerName: string) => {
    const sub: SubstitutionLog = {
      playerIn: playerName,
      playerOut: "",
      minute
    };

    await saveSubstitution(sub);
    setSubstitutions(prev => [...prev, sub]);
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

  const logAction = async (actionId: string, result: ActionResult, note?: string) => {
    await saveActionLog(actionId, result, note);
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

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {gamePhase !== "preview" && (
        <GameTimer
          isRunning={isTimerRunning}
          minute={minute}
          onMinuteChange={setMinute}
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
        <div className="space-y-4">
          <GameStats actions={actions} actionLogs={actionLogs} />
          
          <GameActionsList actions={actions} onLog={logAction} />

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
          
          <GamePhaseManager
            gamePhase={gamePhase}
            onStartMatch={startMatch}
            onEndHalf={endHalf}
            onStartSecondHalf={startSecondHalf}
            onEndMatch={endMatch}
          />
        </div>
      )}

      <GoalsAchievement actions={actions} actionLogs={actionLogs} />

      <HalftimeSummary
        isOpen={gamePhase === "halftime" && showSummary}
        onClose={() => setShowSummary(false)}
        onStartSecondHalf={startSecondHalf}
        actions={actions}
        actionLogs={actionLogs}
      />

      <Dialog open={gamePhase === "ended" && showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-md mx-auto">
          <GameSummary 
            actions={actions}
            actionLogs={actionLogs}
            generalNotes={generalNotes}
            substitutions={substitutions}
            onClose={() => setShowSummary(false)}
            gamePhase="ended"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};