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
        // Type guard function to validate PreMatchReportActions
        const isPreMatchReportAction = (item: any): item is PreMatchReportActions => {
          return (
            typeof item === 'object' &&
            item !== null &&
            'id' in item &&
            typeof item.id === 'string' &&
            'name' in item &&
            typeof item.name === 'string' &&
            'isSelected' in item &&
            typeof item.isSelected === 'boolean'
          );
        };

        // Safely convert and filter the actions
        const rawActions = Array.isArray(match.pre_match_reports.actions) 
          ? match.pre_match_reports.actions 
          : [];
        
        const validActions = rawActions
          .filter(isPreMatchReportAction)
          .map(action => ({
            id: action.id,
            name: action.name,
            isSelected: action.isSelected,
            goal: action.goal
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