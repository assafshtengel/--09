import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useGameNotes = (matchId: string | undefined) => {
  const [generalNote, setGeneralNote] = useState("");
  const { toast } = useToast();

  const handleAddGeneralNote = async (minute: number) => {
    if (!generalNote.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין טקסט להערה",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('match_notes')
        .insert([
          {
            match_id: matchId,
            minute,
            note: generalNote
          }
        ]);

      if (error) throw error;
      
      setGeneralNote("");
      toast({
        title: "הערה נוספה",
        description: "ההערה נשמרה בהצלחה",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההערה",
        variant: "destructive",
      });
    }
  };

  return {
    generalNote,
    setGeneralNote,
    handleAddGeneralNote
  };
};