import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";
type ActionResult = "success" | "failure";

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

export const useMatchStorage = () => {
  const { toast } = useToast();
  const [matchId, setMatchId] = useState<string | null>(null);

  const createMatch = async () => {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .insert([
          { 
            match_date: new Date().toISOString().split('T')[0],
            status: 'preview'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setMatchId(match.id);
      return match.id;
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור משחק חדש",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveActionLog = async (actionId: string, result: ActionResult, minute: number, note?: string) => {
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

  return {
    matchId,
    createMatch,
    saveActionLog,
    saveNote,
    saveSubstitution,
    updateMatchStatus
  };
};