import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { GamePhase } from "@/types/game";

export const useMatchActions = (matchId: string | undefined) => {
  const { toast } = useToast();

  const saveActionLog = async (actionId: string, result: "success" | "failure", minute: number, note?: string) => {
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

  const saveNote = async (note: string, minute: number) => {
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

  const saveSubstitution = async (playerIn: string, playerOut: string, minute: number) => {
    if (!matchId) return;

    try {
      const { error } = await supabase
        .from('match_substitutions')
        .insert([
          {
            match_id: matchId,
            minute,
            player_in: playerIn,
            player_out: playerOut
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

  return {
    saveActionLog,
    saveNote,
    saveSubstitution,
    updateMatchStatus,
  };
};