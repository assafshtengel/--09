import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMatchActions = (userId: string) => {
  return useQuery({
    queryKey: ["match-actions", userId],
    queryFn: async () => {
      // First get matches for the user
      const { data: matches, error: matchesError } = await supabase
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
        .order('match_date', { ascending: true });

      if (matchesError) {
        throw matchesError;
      }

      // Flatten the data structure to match the expected format
      const flattenedData = matches?.flatMap(match => 
        match.match_actions?.map(action => ({
          ...action,
          match: {
            match_date: match.match_date
          }
        })) || []
      );

      return flattenedData;
    },
    enabled: !!userId,
  });
};