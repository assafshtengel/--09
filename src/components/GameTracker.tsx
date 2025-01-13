import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";
import { GamePreview } from "./game/GamePreview";
import { GameLayout } from "./game/mobile/GameLayout";
import { GameTimer } from "./game/GameTimer";
import { GameActionsList } from "./game/GameActionsList";
import { GameNotes } from "./game/GameNotes";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { HalftimeSummary } from "./game/HalftimeSummary";
import { GameSummary } from "./game/GameSummary";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PreMatchReportAction {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
}

interface Match {
  id: string;
  player_id: string;
  match_date: string;
  status: string;
  opponent?: string;
  location?: string;
  pre_match_report_id?: string;
  match_type?: string;
  final_score?: string;
  player_position?: string;
  team?: string;
  team_name?: string;
  player_role?: string;
  pre_match_reports?: {
    actions: PreMatchReportAction[];
    havaya?: string;
  };
}

type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";

interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

export const GameTracker = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionLog[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [minute, setMinute] = useState(0);
  const [havaya, setHavaya] = useState<string[]>([]);
  const [matchDetails, setMatchDetails] = useState<Match>({
    id: "",
    player_id: "",
    match_date: new Date().toISOString(),
    status: "preview",
  });
  const [gamePhase, setGamePhase] = useState<GamePhase>("preview");
  const [showHalftimeDialog, setShowHalftimeDialog] = useState(false);
  const [halftimeNotes, setHalftimeNotes] = useState("");

  useEffect(() => {
    if (id) {
      loadMatchData();
    }
  }, [id]);

  const loadMatchData = async () => {
    try {
      setIsLoading(true);
      
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(`
          *,
          pre_match_reports (
            actions,
            havaya
          )
        `)
        .eq("id", id)
        .single();

      if (matchError) {
        console.error("Error loading match data:", matchError);
        throw matchError;
      }

      if (!match) {
        throw new Error("Match not found");
      }

      setMatchDetails(match as Match);

      if (match?.pre_match_reports) {
        if (match.pre_match_reports.havaya) {
          setHavaya(match.pre_match_reports.havaya.split(','));
        }

        if (match.pre_match_reports.actions) {
          const rawActions = match.pre_match_reports.actions;
          
          if (Array.isArray(rawActions)) {
            const validActions = rawActions
              .filter((action): action is PreMatchReportAction => 
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
          }
        }
      }

      const { data: logs, error: logsError } = await supabase
        .from("match_actions")
        .select("*")
        .eq("match_id", id)
        .order("minute", { ascending: true });

      if (logsError) {
        console.error("Error loading action logs:", logsError);
        throw logsError;
      }

      if (logs) {
        const formattedLogs = logs.map(log => ({
          actionId: log.action_id,
          minute: log.minute,
          result: log.result as "success" | "failure",
          note: log.note
        }));
        setActionLogs(formattedLogs);
      }

      const { data: notes, error: notesError } = await supabase
        .from("match_notes")
        .select("*")
        .eq("match_id", id)
        .order("minute", { ascending: true });

      if (notesError) {
        console.error("Error loading notes:", notesError);
        throw notesError;
      }

      if (notes) {
        const formattedNotes = notes.map(note => ({
          text: note.note,
          minute: note.minute
        }));
        setGeneralNotes(formattedNotes);
      }

      const { data: subs, error: subsError } = await supabase
        .from("match_substitutions")
        .select("*")
        .eq("match_id", id)
        .order("minute", { ascending: true });

      if (subsError) {
        console.error("Error loading substitutions:", subsError);
        throw subsError;
      }

      if (subs) {
        const formattedSubs = subs.map(sub => ({
          playerIn: sub.player_in,
          playerOut: sub.player_out,
          minute: sub.minute
        }));
        setSubstitutions(formattedSubs);
      }

      setGamePhase(match.status as GamePhase);

    } catch (error) {
      console.error("Error loading match data:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני המשחק",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAction = async (actionId: string, result: "success" | "failure", note?: string) => {
    try {
      const { error } = await supabase
        .from("match_actions")
        .insert([
          {
            match_id: id,
            action_id: actionId,
            minute,
            result,
            note
          }
        ]);

      if (error) throw error;

      setActionLogs(prev => [...prev, { actionId, result, minute, note }]);
    } catch (error) {
      console.error("Error adding action:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את הפעולה",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async (note: string) => {
    try {
      const { error } = await supabase
        .from("match_notes")
        .insert([
          {
            match_id: id,
            minute,
            note
          }
        ]);

      if (error) throw error;

      setGeneralNotes(prev => [...prev, { text: note, minute }]);
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את ההערה",
        variant: "destructive",
      });
    }
  };

  const handleAddSubstitution = async (sub: SubstitutionLog) => {
    try {
      const { error } = await supabase
        .from("match_substitutions")
        .insert([
          {
            match_id: id,
            minute: sub.minute,
            player_in: sub.playerIn,
            player_out: sub.playerOut
          }
        ]);

      if (error) throw error;

      setSubstitutions(prev => [...prev, sub]);
    } catch (error) {
      console.error("Error adding substitution:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את החילוף",
        variant: "destructive",
      });
    }
  };

  const startMatch = async () => {
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "playing" })
        .eq("id", id);

      if (error) throw error;

      setGamePhase("playing");
      setIsTimerRunning(true);
    } catch (error) {
      console.error("Error starting match:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להתחיל את המשחק",
        variant: "destructive",
      });
    }
  };

  const handleHalftime = () => {
    setShowHalftimeDialog(true);
    setIsTimerRunning(false);
  };

  const startSecondHalf = async () => {
    try {
      if (halftimeNotes) {
        const { error } = await supabase
          .from("match_halftime_notes")
          .insert([
            {
              match_id: id,
              notes: halftimeNotes
            }
          ]);

        if (error) throw error;
      }

      const { error: matchError } = await supabase
        .from("matches")
        .update({ status: "secondHalf" })
        .eq("id", id);

      if (matchError) throw matchError;

      setGamePhase("secondHalf");
      setShowHalftimeDialog(false);
      setIsTimerRunning(true);
    } catch (error) {
      console.error("Error starting second half:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להתחיל את המחצית השנייה",
        variant: "destructive",
      });
    }
  };

  const endMatch = async () => {
    try {
      const { error } = await supabase
        .from("matches")
        .update({ status: "ended" })
        .eq("id", id);

      if (error) throw error;

      setGamePhase("ended");
      setIsTimerRunning(false);
    } catch (error) {
      console.error("Error ending match:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לסיים את המשחק",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GameTimer 
        isRunning={isTimerRunning}
        minute={minute}
        onMinuteChange={setMinute}
      />

      {gamePhase === "preview" && (
        <div className="space-y-6">
          {havaya.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-right mb-4">הוויות נבחרות</h3>
              <div className="flex flex-wrap gap-2 justify-end">
                {havaya.map((h, index) => (
                  <Badge key={index} variant="secondary" className="text-lg py-2 px-4">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <GamePreview
            actions={actions}
            onActionAdd={handleAddAction}
            onStartMatch={startMatch}
          />
        </div>
      )}

      {(gamePhase === "playing" || gamePhase === "secondHalf") && (
        <div className="space-y-6">
          <GameActionsList
            actions={actions}
            onLog={handleAddAction}
          />
          <GameNotes
            notes={generalNotes}
            onAddNote={handleAddNote}
          />
          <PlayerSubstitution
            onSubstitute={handleAddSubstitution}
          />
        </div>
      )}

      {gamePhase === "ended" && (
        <GameSummary
          actions={actions}
          actionLogs={actionLogs}
          generalNotes={generalNotes}
          substitutions={substitutions}
          onClose={() => {}}
          gamePhase={gamePhase}
          matchId={id}
          opponent={matchDetails.opponent || null}
          matchDate={matchDetails.match_date}
        />
      )}

      <Dialog open={showHalftimeDialog} onOpenChange={setShowHalftimeDialog}>
        <DialogContent>
          <HalftimeSummary
            isOpen={showHalftimeDialog}
            onClose={() => setShowHalftimeDialog(false)}
            onStartSecondHalf={startSecondHalf}
            actions={actions}
            actionLogs={actionLogs}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};