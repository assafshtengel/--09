import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";
import { GameContent } from "./game/GameContent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GamePhase, PreMatchReportActions, ActionLog } from "@/types/game";

interface GameTrackerProps {
  matchId: string;
}

interface MatchData {
  id: string;
  created_at: string;
  location: string | null;
  match_date: string;
  opponent: string | null;
  player_id: string;
  pre_match_report_id: string | null;
  status: GamePhase;
  pre_match_reports?: {
    actions?: PreMatchReportActions[] | null;
    havaya?: string | null;
    questions_answers?: Record<string, any> | null;
  } | null;
}

export const GameTracker = ({ matchId }: GameTrackerProps) => {
  const { toast } = useToast();
  const [gamePhase, setGamePhase] = useState<GamePhase>("preview");
  const [minute, setMinute] = useState(0);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);

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
            actions,
            havaya,
            questions_answers
          )
        `)
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      const typedMatch = match as unknown as MatchData;
      setMatchData(typedMatch);

      if (typedMatch?.pre_match_reports?.actions) {
        const rawActions = typedMatch.pre_match_reports.actions;
        
        const validActions = (Array.isArray(rawActions) ? rawActions : [])
          .filter((action): action is PreMatchReportActions => 
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

      setGamePhase(typedMatch.status as GamePhase);
    } catch (error) {
      console.error("Error loading match data:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני המשחק",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-24 md:pb-0">
        <GameContent
          gamePhase={gamePhase}
          isTimerRunning={isTimerRunning}
          minute={minute}
          onMinuteChange={setMinute}
          actions={actions}
          actionLogs={actionLogs}
          generalNotes={generalNotes}
          showSummary={showSummary}
          setShowSummary={setShowSummary}
          matchId={matchId}
          matchData={matchData}
          onStartMatch={startMatch}
          onEndHalf={endHalf}
          onStartSecondHalf={startSecondHalf}
          onEndMatch={endMatch}
          onActionAdd={handleAddAction}
        />
      </div>
    </div>
  );
};