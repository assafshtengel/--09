import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Type guard function to validate action shape
function isValidAction(item: unknown): item is Action {
  if (!item || typeof item !== 'object') return false;
  
  const action = item as Record<string, unknown>;
  
  return (
    typeof action.id === 'string' &&
    typeof action.name === 'string' &&
    typeof action.isSelected === 'boolean'
  );
}

export const useGameActions = (matchId: string | undefined) => {
  const [actions, setActions] = useState<Action[]>([]);

  const loadMatchActions = async () => {
    if (!matchId) return;

    try {
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(`
          *,
          pre_match_reports (
            actions
          )
        `)
        .eq("id", matchId)
        .maybeSingle();

      if (matchError) throw matchError;

      if (match?.pre_match_reports?.actions) {
        const actionsArray = Array.isArray(match.pre_match_reports.actions) 
          ? match.pre_match_reports.actions 
          : [];

        const validActions = actionsArray
          .filter(isValidAction)
          .map(action => ({
            ...action,
            goal: typeof action.goal === 'string' ? action.goal : undefined
          }));

        setActions(validActions);
      }
    } catch (error) {
      console.error("Error loading match actions:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני המשחק",
        variant: "destructive",
      });
    }
  };

  const handleAddAction = (newAction: Action) => {
    setActions(prev => [...prev, newAction]);
    toast({
      title: "פעולה נוספה",
      description: `הפעולה ${newAction.name} נוספה למעקב`,
    });
  };

  return {
    actions,
    loadMatchActions,
    handleAddAction
  };
};