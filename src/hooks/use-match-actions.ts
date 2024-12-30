import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMatchActions = (playerId: string) => {
  return useQuery({
    queryKey: ["match-actions", playerId],
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
        .eq('player_id', playerId)
        .order('match_date', { ascending: false });

      if (error) {
        console.error('Error fetching match actions:', error);
        throw error;
      }

      // Flatten the nested structure to match the expected format
      const flattenedData = data?.flatMap(match => 
        match.match_actions?.map(action => ({
          ...action,
          matches: {
            match_date: match.match_date
          }
        })) || []
      ) || [];

      return flattenedData;
    },
    enabled: !!playerId
  });
};