import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ActionLog } from "@/types/game";
import { Action } from "@/components/ActionSelector";

interface MatchData {
  id: string;
  created_at: string;
  location: string | null;
  match_date: string;
  opponent: string | null;
  player_id: string;
  pre_match_report_id: string | null;
  status: string;
  pre_match_reports?: {
    actions?: any[] | null;
    havaya?: string | null;
    questions_answers?: Record<string, any> | null;
  } | null;
}

export const useMatchData = (matchId: string) => {
  const { toast } = useToast();
  const [matchData, setMatchData] = useState<MatchData | null>(null);

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

      setMatchData(match as MatchData);

      if (match?.pre_match_reports?.actions) {
        const rawActions = match.pre_match_reports.actions;
        
        const validActions = (Array.isArray(rawActions) ? rawActions : [])
          .filter((action): action is any => 
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
          
        return validActions;
      }
    } catch (error) {
      console.error("Error loading match data:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני המשחק",
        variant: "destructive",
      });
    }
    return [];
  };

  const loadActionLogs = async () => {
    if (!matchId) return [];

    try {
      const { data: logs, error } = await supabase
        .from('match_actions')
        .select('*')
        .eq('match_id', matchId)
        .order('minute', { ascending: true });

      if (error) throw error;

      return (logs || []).map(log => ({
        actionId: log.action_id,
        minute: log.minute,
        result: log.result as "success" | "failure",
        note: log.note || undefined
      }));
    } catch (error) {
      console.error("Error loading action logs:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את היסטוריית הפעולות",
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const actions = await loadMatchData();
      const logs = await loadActionLogs();
      return { actions, logs };
    };

    initializeData();
  }, [matchId]);

  return { matchData, loadMatchData, loadActionLogs };
};