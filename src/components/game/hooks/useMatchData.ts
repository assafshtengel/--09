import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ActionLog, MatchData, PreMatchReportActions } from "@/types/game";

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
          pre_match_report:pre_match_report_id (
            actions,
            havaya,
            questions_answers
          )
        `)
        .eq("id", matchId)
        .single();

      if (matchError) throw matchError;

      // Transform the data to match our MatchData type
      const transformedMatch: MatchData = {
        ...match,
        pre_match_report: match?.pre_match_report ? {
          actions: Array.isArray(match.pre_match_report.actions) 
            ? match.pre_match_report.actions.map((action: any) => ({
                id: action.id,
                name: action.name,
                goal: action.goal,
                isSelected: action.isSelected
              }))
            : [],
          havaya: match.pre_match_report.havaya,
          questions_answers: typeof match.pre_match_report.questions_answers === 'object' 
            ? match.pre_match_report.questions_answers 
            : {}
        } : undefined
      };

      setMatchData(transformedMatch);
      
      if (transformedMatch?.pre_match_report?.actions) {
        return transformedMatch.pre_match_report.actions;
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

      return logs || [];
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

  return { matchData, loadMatchData, loadActionLogs };
};