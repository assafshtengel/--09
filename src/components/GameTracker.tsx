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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GamePhase, PreMatchReportActions, ActionLog, SubstitutionLog, Match, PreMatchReport } from "@/types/game";

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
  const [matchDetails, setMatchDetails] = useState<Match>({
    id: "",
    player_id: "",
    created_at: "",
    match_date: "",
    opponent: null,
    location: null,
    status: "preview",
    pre_match_report_id: null,
    match_type: null,
    final_score: null,
    player_position: null,
    team: null,
    team_name: null,
    player_role: null,
    observer_type: undefined,
  });

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  const loadMatchData = async () => {
    if (!matchId) return;

    try {
      console.log("Loading match data for ID:", matchId);
      
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(`
          *,
          pre_match_reports (
            *
          )
        `)
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      console.log("Fetched match data:", match);

      // Type assertion for match data
      const typedMatch = match as unknown as Match;
      setMatchDetails(typedMatch);

      if (match?.pre_match_reports?.actions) {
        console.log("Raw actions from pre_match_reports:", match.pre_match_reports.actions);
        
        // Parse actions string if it's a string
        const parsedActions = typeof match.pre_match_reports.actions === 'string' 
          ? JSON.parse(match.pre_match_reports.actions)
          : match.pre_match_reports.actions;
        
        // Ensure actions is an array
        const actionsArray = Array.isArray(parsedActions) 
          ? parsedActions 
          : [parsedActions];
            
        const validActions = actionsArray
          .filter((action): action is PreMatchReportActions => 
            action !== null &&
            typeof action === 'object' &&
            'id' in action &&
            'name' in action &&
            'isSelected' in action
          )
          .map(action => ({
            id: String(action.id),
            name: String(action.name),
            goal: action.goal ? String(action.goal) : undefined,
            isSelected: Boolean(action.isSelected)
          }));
          
        console.log("Parsed actions:", validActions);
        setActions(validActions);
      } else {
        console.log("No actions found in pre_match_reports");
        setActions([]);
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

  const updateMatchStatus = async (gamePhase: GamePhase) => {
    if (!matchId) return;

    try {
      console.log("Updating match status to:", gamePhase);
      
      // Map GamePhase to valid database status values
      const dbStatus = (() => {
        switch(gamePhase) {
          case "preview":
            return "preview";
          case "playing":
            return "in_progress";
          case "halftime":
            return "halftime";
          case "secondHalf":
            return "second_half";
          case "ended":
            return "completed";
          default:
            throw new Error(`Invalid game phase: ${gamePhase}`);
        }
      })();

      console.log("Mapped status value:", dbStatus);

      const { error } = await supabase
        .from('matches')
        .update({ status: dbStatus })
        .eq('id', matchId);

      if (error) {
        console.error("Error updating match status:", error);
        // Revert the UI state if the update fails
        setGamePhase(prevPhase => {
          console.log("Reverting game phase to:", prevPhase);
          return prevPhase;
        });
        throw error;
      }

      console.log("Successfully updated match status to:", dbStatus);
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
  );
};
