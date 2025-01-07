import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GamePhase, PreMatchReportActions, ActionLog, SubstitutionLog, Match, PreMatchReport } from "@/types/game";
import { GameTimer } from "./game/GameTimer";
import { GameScore } from "./game/GameScore";
import { GameActionsList } from "./game/GameActionsList";
import { GameNotes } from "./game/GameNotes";
import { GameSummary } from "./game/GameSummary";
import { GamePreview } from "./game/GamePreview";
import { HalftimeSummary } from "./game/HalftimeSummary";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Home } from "lucide-react";

export const GameTracker = () => {
  const navigate = useNavigate();
  const { id: matchId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [match, setMatch] = useState<Match | null>(null);
  const [preMatchReport, setPreMatchReport] = useState<PreMatchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("pre-match");
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [substitutionLogs, setSubstitutionLogs] = useState<SubstitutionLog[]>([]);

  const handleHomeClick = () => {
    navigate("/");
  };

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("id", matchId)
          .single();

        if (error) throw error;
        setMatch(data);
        // Fetch related pre-match report and logs
        const { data: reportData } = await supabase
          .from("pre_match_reports")
          .select("*")
          .eq("id", data.pre_match_report_id)
          .single();
        setPreMatchReport(reportData);

        // Fetch action logs
        const { data: actionsData } = await supabase
          .from("match_actions")
          .select("*")
          .eq("match_id", matchId);
        setActionLogs(actionsData);

        // Fetch substitution logs
        const { data: subsData } = await supabase
          .from("match_substitutions")
          .select("*")
          .eq("match_id", matchId);
        setSubstitutionLogs(subsData);
      } catch (err) {
        setError("Error fetching match data");
        toast.error("Error fetching match data");
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId, toast]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={handleHomeClick}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          חזרה לדף הבית
        </Button>
      </div>
      
      <GameTimer match={match} />
      <GameScore match={match} />
      <GameActionsList actions={actionLogs} />
      <GameNotes match={match} />
      <GameSummary match={match} />
      <GamePreview preMatchReport={preMatchReport} />
      <HalftimeSummary match={match} />
    </div>
  );
};
