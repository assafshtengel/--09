import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GameSummary as GameSummaryComponent } from "@/components/game/GameSummary";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const GameSummary = () => {
  const { id } = useParams<{ id: string }>();

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          match_actions (
            id,
            action_id,
            minute,
            result,
            note
          ),
          match_notes (
            minute,
            note
          ),
          match_substitutions (
            minute,
            player_in,
            player_out
          ),
          pre_match_report:pre_match_report_id (
            actions,
            questions_answers,
            havaya
          )
        `)
        .eq('id', id)
        .single();

      if (matchError) throw matchError;
      return matchData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">לא נמצא משחק</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <GameSummaryComponent
        actions={match.pre_match_report?.actions || []}
        actionLogs={match.match_actions || []}
        generalNotes={match.match_notes || []}
        substitutions={match.match_substitutions || []}
        onClose={() => {}}
        gamePhase="ended"
        matchId={match.id}
        opponent={match.opponent}
        matchDate={match.match_date}
      />
    </div>
  );
};

export default GameSummary;