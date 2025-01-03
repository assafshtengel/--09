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
        const rawActions = match.pre_match_reports.actions as PreMatchReportActions[];
        
        const validActions = rawActions
          .filter(action => 
            typeof action === 'object' && 
            action !== null && 
            'id' in action && 
            'name' in action && 
            'isSelected' in action
          )
          .map(action => ({
            id: action.id,
            name: action.name,
            goal: action.goal,
            isSelected: action.isSelected
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