import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";

export const useActionManager = (
  matchId: string, 
  minute: number, 
  actions: Action[], 
  onActionLogged?: () => void
) => {
  const { toast } = useToast();

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

      const action = actions.find(a => a.id === actionId);
      toast({
        title: result === "success" ? `${action?.name || ''} - הצלחה` : `${action?.name || ''} - כישלון`,
        description: result === "success" ? "✓ הפעולה נרשמה בהצלחה" : "✗ הפעולה נרשמה ככישלון",
        variant: result === "success" ? "default" : "destructive",
        duration: 2000,
      });

      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      // Notify parent component to refresh action logs
      if (onActionLogged) {
        onActionLogged();
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

  return { handleActionLog };
};