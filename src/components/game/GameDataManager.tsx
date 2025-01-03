import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ActionLog, SubstitutionLog } from "@/types/game";

export const useGameData = (matchId: string | undefined) => {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionLog[]>([]);
  const { toast } = useToast();

  const saveActionLog = async (actionId: string, result: "success" | "failure", minute: number, note?: string) => {
    if (!matchId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה משחק",
        variant: "destructive",
      });
      return;
    }

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
      
      setActionLogs(prev => [...prev, { actionId, minute, result, note }]);
      
      toast({
        title: result === "success" ? "פעולה הצליחה" : "פעולה נכשלה",
        className: result === "success" ? "bg-green-500" : "bg-red-500",
        duration: 1000,
      });
    } catch (error) {
      console.error('Error saving action:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הפעולה",
        variant: "destructive",
      });
    }
  };

  const saveSubstitution = async (sub: SubstitutionLog) => {
    if (!matchId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה משחק",
        variant: "destructive",
      });
      return;
    }

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
      
      setSubstitutions(prev => [...prev, sub]);
      
      toast({
        title: "חילוף בוצע",
        description: sub.playerIn ? `${sub.playerIn} נכנס למשחק` : `${sub.playerOut} יצא מהמשחק`,
      });
    } catch (error) {
      console.error('Error saving substitution:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את החילוף",
        variant: "destructive",
      });
    }
  };

  return {
    actionLogs,
    generalNotes,
    substitutions,
    saveActionLog,
    saveSubstitution
  };
};