import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Action } from "@/components/ActionSelector";

interface ActionData {
  id: string;
  name: string;
  isSelected?: boolean;
  goal?: string;
}

// Type guard to validate action data
function isValidAction(item: unknown): item is ActionData {
  if (!item || typeof item !== 'object') return false;
  
  const action = item as Record<string, unknown>;
  return (
    typeof action.id === 'string' &&
    typeof action.name === 'string' &&
    (action.isSelected === undefined || typeof action.isSelected === 'boolean') &&
    (action.goal === undefined || typeof action.goal === 'string')
  );
}

export const useGameActions = (matchId: string | undefined) => {
  return useQuery({
    queryKey: ["game-actions", matchId],
    queryFn: async () => {
      if (!matchId) {
        throw new Error("Match ID is required");
      }

      const { data: match, error } = await supabase
        .from("matches")
        .select(`
          pre_match_reports (
            actions
          )
        `)
        .eq("id", matchId)
        .single();

      if (error) {
        throw error;
      }

      let actions: Action[] = [];

      if (match?.pre_match_reports?.actions) {
        // Ensure we're working with an array
        const actionsArray = Array.isArray(match.pre_match_reports.actions) 
          ? match.pre_match_reports.actions as unknown[]
          : [];

        // First validate and transform the data
        actions = actionsArray
          .filter((item): item is unknown => item !== null)
          .filter(isValidAction)
          .map(action => ({
            id: action.id,
            name: action.name,
            isSelected: action.isSelected ?? false,
            goal: action.goal
          }));
      }

      return actions;
    },
    enabled: !!matchId,
  });
};