import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PreMatchReportActions, ActionLog, SubstitutionLog, GamePhase } from "@/types/game";

export const useGameDataService = () => {
  const loadMatchData = async (matchId: string) => {
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

      if (match?.pre_match_report?.actions) {
        const preMatchActions = match.pre_match_report.actions as unknown as PreMatchReportActions[];
        
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
          
        return {
          actions: validActions,
          status: match.status as GamePhase
        };
      }

      return null;
    } catch (error) {
      console.error("Error loading match data:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני המשחק",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveActionLog = async (matchId: string, action_id: string, minute: number, result: "success" | "failure", note?: string) => {
    try {
      const { error } = await supabase
        .from('match_actions')
        .insert([{ match_id: matchId, action_id, minute, result, note }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving action:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הפעולה",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveNote = async (matchId: string, minute: number, note: string) => {
    try {
      const { error } = await supabase
        .from('match_notes')
        .insert([{ match_id: matchId, minute, note }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההערה",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveSubstitution = async (matchId: string, sub: SubstitutionLog) => {
    try {
      const { error } = await supabase
        .from('match_substitutions')
        .insert([{
          match_id: matchId,
          minute: sub.minute,
          player_in: sub.playerIn,
          player_out: sub.playerOut
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving substitution:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את החילוף",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateMatchStatus = async (matchId: string, status: GamePhase) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating match status:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את סטטוס המשחק",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    loadMatchData,
    saveActionLog,
    saveNote,
    saveSubstitution,
    updateMatchStatus,
  };
};