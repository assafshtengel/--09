import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { GameSummary as GameSummaryComponent } from "@/components/game/GameSummary";
import { useNavigate } from "react-router-dom";

const GameSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*, match_actions(*), match_notes(*), match_substitutions(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!match) {
    return <div>Match not found</div>;
  }

  return (
    <GameSummaryComponent
      actions={match.match_actions || []}
      actionLogs={[]} // This will be populated from match data
      generalNotes={match.match_notes || []}
      substitutions={match.match_substitutions || []}
      onClose={() => navigate("/game-history")}
      gamePhase="ended"
      matchId={id}
      opponent={match.opponent}
      matchDate={match.match_date}
    />
  );
};

export default GameSummary;