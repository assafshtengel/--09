import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GameNotes } from "./GameNotes";

interface GameNoteManagerProps {
  matchId: string;
  minute: number;
}

export const GameNoteManager = ({ matchId, minute }: GameNoteManagerProps) => {
  const [generalNote, setGeneralNote] = useState("");
  const { toast } = useToast();

  const saveNote = async (note: string) => {
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

      toast({
        title: "ההערה נשמרה",
        description: "ההערה נשמרה בהצלחה",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההערה",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleAddNote = async () => {
    if (!generalNote.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין טקסט להערה",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    await saveNote(generalNote);
    setGeneralNote("");
  };

  return (
    <GameNotes
      generalNote={generalNote}
      onNoteChange={setGeneralNote}
      onAddNote={handleAddNote}
    />
  );
};