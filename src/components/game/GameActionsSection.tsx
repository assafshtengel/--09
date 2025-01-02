import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { ActionItem } from "./ActionItem";
import { GameNotes } from "./GameNotes";
import { PlayerSubstitution } from "./PlayerSubstitution";
import { toast } from "@/hooks/use-toast";
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
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההערה",
        variant: "destructive",
      });
    }
  };

  const handleAddGeneralNote = async () => {
    if (!generalNote.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין טקסט להערה",
        variant: "destructive",
      });
      return;
    }

    await saveNote(generalNote);
    setGeneralNote("");
    toast({
      title: "ההערה נשמרה",
      description: "ההערה נשמרה בהצלחה",
    });
  };

  return (
    <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="grid gap-4">
        {actions.map(action => (
          <ActionItem
            key={action.id}
            action={action}
            stats={calculateActionStats(action.id)}
            onLog={async (actionId, result, note) => {
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
            }}
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
          } catch (error) {
            console.error('Error saving substitution:', error);
            toast({
              title: "שגיאה",
              description: "לא ניתן לשמור את החילוף",
              variant: "destructive",
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
          } catch (error) {
            console.error('Error saving substitution:', error);
            toast({
              title: "שגיאה",
              description: "לא ניתן לשמור את החילוף",
              variant: "destructive",
            });
          }
        }}
      />
    </div>
  );
};