import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";
import { GamePreviewSection } from "./game/GamePreviewSection";
import { GameSummary } from "./game/GameSummary";
import { GameLayout } from "./game/mobile/GameLayout";
import { ActionsList } from "./game/mobile/ActionsList";
import { GameNotes } from "./game/GameNotes";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { HalftimeSummary } from "./game/HalftimeSummary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GamePhase, PreMatchReportActions, ActionLog, SubstitutionLog, Match } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export const GameTracker = () => {
  const { id: matchId } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

      const typedMatch = match as unknown as Match;
      setMatchDetails(typedMatch);

      if (match?.pre_match_reports?.actions) {
        const rawActions = match.pre_match_reports.actions as unknown as PreMatchReportActions[];
        
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

  const startMatchWithObserver = async (observerType: "parent" | "player") => {
    try {
      const { error: updateError } = await supabase
        .from('matches')
        .update({ 
          status: "playing",
          observer_type: observerType 
        })
        .eq('id', matchId);

      if (updateError) throw updateError;

      setGamePhase("playing");
      setMinute(0);
      setIsTimerRunning(true);

      toast({
        title: observerType === "parent" ? "הורה ימלא במהלך המשחק" : "שחקן ימלא בצפייה בשידור",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error starting match:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להתחיל את המשחק",
        variant: "destructive",
      });
    }
  };

  const endHalf = async () => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'halftime' })
        .eq('id', matchId);

      if (error) throw error;

      setGamePhase("halftime");
      setShowSummary(true);
      setIsTimerRunning(false);
    } catch (error) {
      console.error('Error ending half:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לסיים את המחצית",
        variant: "destructive",
      });
    }
  };

  const startSecondHalf = async () => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'secondHalf' })
        .eq('id', matchId);

      if (error) throw error;

      setGamePhase("secondHalf");
      setShowSummary(false);
      setIsTimerRunning(true);
    } catch (error) {
      console.error('Error starting second half:', error);
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
        .from('matches')
        .update({ status: 'ended' })
        .eq('id', matchId);

      if (error) throw error;

      setGamePhase("ended");
      setShowSummary(true);
      setIsTimerRunning(false);
    } catch (error) {
      console.error('Error ending match:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לסיים את המשחק",
        variant: "destructive",
      });
    }
  };

  const handleAddAction = (action: Action) => {
    setActions(prev => [...prev, action]);
  };

  const logAction = async (actionId: string, result: "success" | "failure", note?: string) => {
    try {
      const newActionLog = {
        actionId,
        minute,
        result,
        note
      };

      const { error } = await supabase
        .from('match_actions')
        .insert([{
          match_id: matchId,
          action_id: actionId,
          minute,
          result,
          note
        }]);

      if (error) throw error;

      setActionLogs(prev => [...prev, newActionLog]);
    } catch (error) {
      console.error('Error logging action:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הפעולה",
        variant: "destructive",
      });
    }
  };

  const handleAddGeneralNote = async () => {
    if (!generalNote.trim()) return;

    try {
      const { error } = await supabase
        .from('match_notes')
        .insert([{
          match_id: matchId,
          minute,
          note: generalNote
        }]);

      if (error) throw error;

      setGeneralNotes(prev => [...prev, { text: generalNote, minute }]);
      setGeneralNote("");
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההערה",
        variant: "destructive",
      });
    }
  };

  const handlePlayerExit = async (playerName: string, canReturn: boolean) => {
    try {
      const { error } = await supabase
        .from('match_substitutions')
        .insert([{
          match_id: matchId,
          minute,
          player_out: playerName,
          player_in: canReturn ? playerName : null
        }]);

      if (error) throw error;

      setSubstitutions(prev => [...prev, {
        playerOut: playerName,
        playerIn: canReturn ? playerName : null,
        minute
      }]);
    } catch (error) {
      console.error('Error handling player exit:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את החילוף",
        variant: "destructive",
      });
    }
  };

  const handlePlayerReturn = async (playerName: string) => {
    try {
      const { error } = await supabase
        .from('match_substitutions')
        .insert([{
          match_id: matchId,
          minute,
          player_in: playerName,
          player_out: null
        }]);

      if (error) throw error;

      setSubstitutions(prev => [...prev, {
        playerIn: playerName,
        playerOut: null,
        minute
      }]);
    } catch (error) {
      console.error('Error handling player return:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את החזרה למשחק",
        variant: "destructive",
      });
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleHomeClick}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          חזרה לדף הבית
        </Button>
        <h1 className="text-lg font-semibold">
          {matchDetails.opponent ? `משחק מול ${matchDetails.opponent}` : 'משחק חדש'}
        </h1>
      </div>

      <GameLayout
        gamePhase={gamePhase}
        isTimerRunning={isTimerRunning}
        minute={minute}
        onMinuteChange={setMinute}
        actions={actions}
        actionLogs={actionLogs}
        onStartMatch={() => {}} // We handle this differently now
        onEndHalf={endHalf}
        onStartSecondHalf={startSecondHalf}
        onEndMatch={endMatch}
      >
        {gamePhase === "preview" && (
          <GamePreviewSection
            actions={actions}
            onActionAdd={handleAddAction}
            onStartMatch={startMatchWithObserver}
          />
        )}

        {gamePhase === "playing" && (
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
    </div>
  );
};
