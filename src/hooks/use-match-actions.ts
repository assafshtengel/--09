import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMatchActions = (userId: string) => {
  return useQuery({
    queryKey: ["match-actions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          match_actions (
            id,
            action_id,
            minute,
            result,
            note
          )
        `)
        .eq('player_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      // Flatten the data structure to match the expected format
      const flattenedData = data?.flatMap(match => 
        match.match_actions.map(action => ({
          ...action,
          match: {
            match_date: match.match_date
          }
        }))
      ) || [];

      return flattenedData;
    },
    enabled: !!userId,
  });
};