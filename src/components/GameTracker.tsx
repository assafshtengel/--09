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
    actions: Array<{
      id: string;
      name: string;
      goal?: string;
      isSelected: boolean;
    }>;
    havaya?: string;
  };
}

interface PreMatchReportActions {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
}

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";

export const GameTracker = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [actionLogs, setActionLogs] = useState<Array<{ action: Action; result: string; minute: number }>>([]);
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionLog[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
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

      setMatchDetails(match);

      if (match?.pre_match_reports) {
        // Set havaya from pre-match report
        if (match.pre_match_reports.havaya) {
          setHavaya(match.pre_match_reports.havaya.split(','));
        }

        // Set actions from pre-match report
        if (match.pre_match_reports.actions) {
          const rawActions = match.pre_match_reports.actions;
          
          if (Array.isArray(rawActions)) {
            const validActions = rawActions
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
          }
        }
      }

      // Load existing action logs
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
          action: actions.find(a => a.id === log.action_id) || {
            id: log.action_id,
            name: "Unknown Action",
            isSelected: true
          },
          result: log.result,
          minute: log.minute
        }));
        setActionLogs(formattedLogs);
      }

      // Load existing notes
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

      // Load existing substitutions
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

      // Set game phase based on match status
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

  const handleAddAction = async (action: Action) => {
    // Implementation for adding action
  };

  const handleAddNote = async (note: string) => {
    // Implementation for adding note
  };

  const handleAddSubstitution = async (substitution: SubstitutionLog) => {
    // Implementation for adding substitution
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
      // Save halftime notes if any
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

      // Update match status
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
    <GameLayout
      phase={gamePhase}
      timer={
        <GameTimer
          isRunning={isTimerRunning}
          onHalftime={handleHalftime}
          onEndMatch={endMatch}
        />
      }
      onEndMatch={endMatch}
    >
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
            actionLogs={actionLogs}
            onActionAdd={handleAddAction}
          />
          <GameNotes
            notes={generalNotes}
            onAddNote={handleAddNote}
          />
          <PlayerSubstitution
            substitutions={substitutions}
            onAddSubstitution={handleAddSubstitution}
          />
        </div>
      )}

      {gamePhase === "ended" && (
        <GameSummary
          matchDetails={matchDetails}
          actions={actions}
          actionLogs={actionLogs}
          notes={generalNotes}
          substitutions={substitutions}
        />
      )}

      <Dialog open={showHalftimeDialog} onOpenChange={setShowHalftimeDialog}>
        <DialogContent>
          <HalftimeSummary
            notes={halftimeNotes}
            onNotesChange={setHalftimeNotes}
            onStartSecondHalf={startSecondHalf}
          />
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
};
