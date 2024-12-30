import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMatchActions = (userId?: string) => {
  return useQuery({
    queryKey: ['matchActions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('match_actions')
        .select(`
          *,
          match:matches!inner(
            match_date,
            player_id
          )
        `)
        .eq('match.player_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching match actions:', error);
        throw error;
      }

      return data;
    },
    enabled: !!userId
  });
};