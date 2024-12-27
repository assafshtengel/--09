import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { ActionItem } from "./game/ActionItem";
import { GameStats } from "./game/GameStats";
import { GameSummary } from "./game/GameSummary";
import { GamePreview } from "./game/GamePreview";
import { GamePhaseManager } from "./game/GamePhaseManager";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface GameTrackerProps {
  actions: Action[];
}

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

export const GameTracker = ({ actions: initialActions }: GameTrackerProps) => {
  const { toast } = useToast();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("preview");
  const [minute, setMinute] = useState(0);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [generalNote, setGeneralNote] = useState("");
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionLog[]>([]);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const createMatch = async () => {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .insert([
          { 
            match_date: new Date().toISOString().split('T')[0],
            status: 'preview'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setMatchId(match.id);
      return match.id;
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור משחק חדש",
        variant: "destructive",
      });
      return null;
    }
  };

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

  const handleSubstitution = async (sub: SubstitutionLog) => {
    await saveSubstitution(sub);
    setSubstitutions(prev => [...prev, sub]);
  };

  const startMatch = async () => {
    const newMatchId = await createMatch();
    if (!newMatchId) return;
    
    setGamePhase("playing");
    await updateMatchStatus("playing");
    
    const interval = setInterval(() => {
      setMinute(prev => prev + 1);
    }, 60000);
    setTimerInterval(Number(interval));
  };

  const endHalf = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setGamePhase("halftime");
    await updateMatchStatus("halftime");
    setShowSummary(true);
  };

  const startSecondHalf = async () => {
    setGamePhase("secondHalf");
    await updateMatchStatus("secondHalf");
    setMinute(45);
    const interval = setInterval(() => {
      setMinute(prev => prev + 1);
    }, 60000);
    setTimerInterval(Number(interval));
    setShowSummary(false);
  };

  const endMatch = async () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
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
  };

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Timer Display */}
      {gamePhase !== "preview" && (
        <div className="fixed top-4 left-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50">
          דקה: {minute}
        </div>
      )}

      {/* Game Preview */}
      {gamePhase === "preview" && (
        <GamePreview
          actions={actions}
          onActionAdd={handleAddAction}
          onStartMatch={startMatch}
        />
      )}

      {/* Game Actions */}
      {(gamePhase === "playing" || gamePhase === "secondHalf") && (
        <div className="space-y-4">
          <GameStats actions={actions} actionLogs={actionLogs} />
          
          <div className="grid gap-3">
            {actions.map(action => (
              <ActionItem
                key={action.id}
                action={action}
                onLog={logAction}
              />
            ))}
          </div>

          {/* General Note */}
          <div className="flex gap-2 items-center">
            <Button onClick={handleAddGeneralNote} size="sm">
              הוסף הערה
            </Button>
            <Input
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder="הערה כללית..."
              className="text-right text-sm"
            />
          </div>

          {/* Player Substitution */}
          <PlayerSubstitution
            minute={minute}
            onSubstitution={handleSubstitution}
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

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-md mx-auto">
          <GameSummary 
            actions={actions}
            actionLogs={actionLogs}
            generalNotes={generalNotes}
            substitutions={substitutions}
            onClose={() => setShowSummary(false)}
            gamePhase={gamePhase === "halftime" ? "halftime" : "ended"}
            onContinueGame={gamePhase === "halftime" ? startSecondHalf : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};