import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PreMatchReportActions } from "@/types/game";

export const useGameActions = (matchId: string | undefined) => {
  const [actions, setActions] = useState<Action[]>([]);
  const { toast } = useToast();

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
        // First ensure we have an array to work with
        const actionsArray = Array.isArray(match.pre_match_reports.actions) 
          ? match.pre_match_reports.actions 
          : [];

        // Type guard to ensure each item has the required properties
        const validActions = actionsArray.reduce<Action[]>((acc, item) => {
          // Skip any non-object items
          if (typeof item !== 'object' || item === null) return acc;
          
          // Cast to unknown first then to our expected type to check properties
          const action = item as unknown as { 
            id?: string; 
            name?: string; 
            isSelected?: boolean;
            goal?: string;
          };

          // Only include items that have all required properties
          if (
            typeof action.id === 'string' &&
            typeof action.name === 'string' &&
            typeof action.isSelected === 'boolean'
          ) {
            acc.push({
              id: action.id,
              name: action.name,
              isSelected: action.isSelected,
              goal: action.goal || undefined
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