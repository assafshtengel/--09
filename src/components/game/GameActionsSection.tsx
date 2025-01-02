import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { ActionItem } from "./ActionItem";
import { GameNotes } from "./GameNotes";
import { PlayerSubstitution } from "./PlayerSubstitution";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GameActionsSectionProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    minute: number;
    result: "success" | "failure";
    note?: string;
  }>;
  minute: number;
  matchId: string;
}

export const GameActionsSection = ({
  actions,
  actionLogs,
  minute,
  matchId,
}: GameActionsSectionProps) => {
  const { toast } = useToast();
  const [generalNote, setGeneralNote] = useState("");

  const calculateActionStats = (actionId: string) => {
    const actionResults = actionLogs.filter(log => log.actionId === actionId);
    return {
      success: actionResults.filter(log => log.result === "success").length,
      total: actionResults.length
    };
  };

  const saveNote = async (note: string) => {
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

  const handleAddGeneralNote = async () => {
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

  const handleActionLog = async (actionId: string, result: "success" | "failure", note?: string) => {
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

      // Show toast notification
      const action = actions.find(a => a.id === actionId);
      toast({
        title: result === "success" ? `${action?.name || ''} - הצלחה` : `${action?.name || ''} - כישלון`,
        description: result === "success" ? "✓ הפעולה נרשמה בהצלחה" : "✗ הפעולה נרשמה ככישלון",
        variant: result === "success" ? "default" : "destructive",
        duration: 2000,
      });

      // Trigger vibration on mobile if supported
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (error) {
      console.error('Error saving action:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הפעולה",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid gap-4">
        {actions.map(action => (
          <ActionItem
            key={action.id}
            action={action}
            stats={calculateActionStats(action.id)}
            onLog={handleActionLog}
          />
        ))}
      </div>

      <GameNotes
        generalNote={generalNote}
        onNoteChange={setGeneralNote}
        onAddNote={handleAddGeneralNote}
      />

      <PlayerSubstitution
        minute={minute}
        onPlayerExit={async (playerName, canReturn) => {
          try {
            const { error } = await supabase
              .from('match_substitutions')
              .insert([
                {
                  match_id: matchId,
                  minute,
                  player_in: "",
                  player_out: playerName
                }
              ]);

            if (error) throw error;

            toast({
              title: "חילוף בוצע",
              description: `${playerName} יצא מהמשחק`,
              duration: 2000,
            });
          } catch (error) {
            console.error('Error saving substitution:', error);
            toast({
              title: "שגיאה",
              description: "לא ניתן לשמור את החילוף",
              variant: "destructive",
              duration: 2000,
            });
          }
        }}
        onPlayerReturn={async (playerName) => {
          try {
            const { error } = await supabase
              .from('match_substitutions')
              .insert([
                {
                  match_id: matchId,
                  minute,
                  player_in: playerName,
                  player_out: ""
                }
              ]);

            if (error) throw error;

            toast({
              title: "חילוף בוצע",
              description: `${playerName} חזר למשחק`,
              duration: 2000,
            });
          } catch (error) {
            console.error('Error saving substitution:', error);
            toast({
              title: "שגיאה",
              description: "לא ניתן לשמור את החילוף",
              variant: "destructive",
              duration: 2000,
            });
          }
        }}
      />
    </div>
  );
};