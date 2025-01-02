import { useState } from "react";
import { ActionButton } from "./ActionButton";
import { Input } from "@/components/ui/input";
import { Action } from "@/components/ActionSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ActionItemProps {
  action: Action;
  stats: { success: number; total: number };
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
  matchId: string;
  minute: number;
}

export const ActionItem = ({ action, stats, onLog, matchId, minute }: ActionItemProps) => {
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const handleAction = async (result: "success" | "failure") => {
    try {
      // Save to Supabase
      const { error } = await supabase
        .from('match_actions')
        .insert([
          {
            match_id: matchId,
            action_id: action.id,
            minute,
            result,
            note: note || undefined
          }
        ]);

      if (error) throw error;

      // Update local state
      onLog(action.id, result, note || undefined);
      setNote("");
    } catch (error) {
      console.error('Error saving action:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הפעולה",
        variant: "destructive",
        duration: 1500,
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{stats.success}/{stats.total}</span>
          <div className="flex gap-2">
            <ActionButton
              actionId={action.id}
              actionName={action.name}
              result="success"
              onClick={() => handleAction("success")}
            />
            <ActionButton
              actionId={action.id}
              actionName={action.name}
              result="failure"
              onClick={() => handleAction("failure")}
            />
          </div>
        </div>
        <span className="font-medium">{action.name}</span>
      </div>
      
      <div className="mt-2">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="הוסף הערה..."
          className="text-right"
        />
      </div>
    </div>
  );
};