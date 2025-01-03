import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMatchActions = (userId: string) => {
  return useQuery({
    queryKey: ["match-actions", userId],
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
        .eq('matches.player_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
};