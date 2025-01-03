import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
        // Ensure we have an array to work with
        const actionsArray = Array.isArray(match.pre_match_reports.actions) 
          ? match.pre_match_reports.actions 
          : [];

        // Convert and validate each action
        const validActions = actionsArray.reduce<Action[]>((acc, item) => {
          // Skip invalid items
          if (!item || typeof item !== 'object') return acc;
          
          // Type assertion with validation
          const action = item as {
            id?: string;
            name?: string;
            isSelected?: boolean;
            goal?: string;
          };

          // Validate required properties
          if (
            typeof action.id === 'string' &&
            typeof action.name === 'string' &&
            typeof action.isSelected === 'boolean'
          ) {
            acc.push({
              id: action.id,
              name: action.name,
              isSelected: action.isSelected,
              goal: typeof action.goal === 'string' ? action.goal : undefined
            });
          }
          
          return acc;
        }, []);

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