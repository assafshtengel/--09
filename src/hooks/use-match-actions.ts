import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMatchActions = (playerId: string) => {
  return useQuery({
    queryKey: ["match-actions", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('match_actions')
        .select(`
          *,
          matches!inner (
            match_date,
            player_id
          )
        `)
        .eq('matches.player_id', playerId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching match actions:', error);
        throw error;
      }

      return data;
    },
    enabled: !!playerId
  });
};