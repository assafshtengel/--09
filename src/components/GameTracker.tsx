import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GamePhase, PreMatchReportActions, ActionLog, SubstitutionLog } from "@/types/game";

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
    loadMatchData();
  }, [matchId]);

  const loadMatchData = async () => {
    if (!matchId) return;

    try {
      // Load match data including pre-match report with all its details
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(`
          *,
          pre_match_reports!inner (
            *
          )
        `)
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      console.log("Loaded match data:", match);

      if (match?.pre_match_reports?.actions) {
        try {
          const rawActions = match.pre_match_reports.actions;
          console.log("Raw actions from DB:", rawActions);
          
          // Ensure rawActions is an array
          const actionsArray = Array.isArray(rawActions) ? rawActions : [];
          
          const validActions = actionsArray
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
            
          console.log("Parsed actions:", validActions);
          setActions(validActions);
        } catch (parseError) {
          console.error("Error parsing actions:", parseError);
          toast({
            title: "שגיאה",
            description: "שגיאה בטעינת הפעולות",
            variant: "destructive",
          });
        }
      }

      // Load existing action logs
      const { data: existingLogs, error: logsError } = await supabase
        .from('match_actions')
        .select('*')
        .eq('match_id', matchId);

      if (logsError) throw logsError;

      if (existingLogs) {
        setActionLogs(existingLogs.map(log => ({
          actionId: log.action_id,
          minute: log.minute,
          result: log.result as "success" | "failure",
          note: log.note
        })));
      }

      // Load existing notes
      const { data: existingNotes, error: notesError } = await supabase
        .from('match_notes')
        .select('*')
        .eq('match_id', matchId);

      if (notesError) throw notesError;

      if (existingNotes) {
        setGeneralNotes(existingNotes.map(note => ({
          text: note.note,
          minute: note.minute
        })));
      }

      // Load existing substitutions
      const { data: existingSubs, error: subsError } = await supabase
        .from('match_substitutions')
        .select('*')
        .eq('match_id', matchId);

      if (subsError) throw subsError;

      if (existingSubs) {
        setSubstitutions(existingSubs.map(sub => ({
          playerIn: sub.player_in,
          playerOut: sub.player_out,
          minute: sub.minute
        })));
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

  const saveActionLog = async (actionId: string, result: "success" | "failure", note?: string) => {
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
      title: "ההערה נשמרה",
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

  const logAction = async (actionId: string, result: "success" | "failure", note?: string) => {
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