import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Game } from "@/types/game";
import { GameCard } from "./GameCard";
import { LoadingScreen } from "@/components/LoadingScreen";

export const GameSelection = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }

        const { data, error } = await supabase
          .from("pre_match_reports")
          .select(`
            id,
            match_date,
            opponent,
            matches (
              id,
              status
            )
          `)
          .eq("player_id", user.id)
          .eq("status", "completed")
          .order("match_date", { ascending: false });

        if (error) throw error;

        const formattedGames: Game[] = (data || []).map(game => ({
          id: game.id,
          match_date: game.match_date,
          opponent: game.opponent,
          match_id: game.matches?.[0]?.id,
          status: game.matches?.[0]?.status === "ended" ? "completed" : "preview"
        }));

        setGames(formattedGames);
      } catch (error) {
        console.error("Error fetching games:", error);
        toast.error("שגיאה בטעינת המשחקים");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [navigate]);

  const handleGameSelect = async (game: Game) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      if (game.status === "completed" && game.match_id) {
        navigate(`/match/${game.match_id}`);
        return;
      }

      const { data: newMatch, error: createError } = await supabase
        .from("matches")
        .insert({
          match_date: game.match_date,
          opponent: game.opponent,
          pre_match_report_id: game.id,
          player_id: user.id,
          status: "preview"
        })
        .select()
        .single();

      if (createError) throw createError;
      if (newMatch) {
        navigate(`/match/${newMatch.id}`);
      }
    } catch (error) {
      console.error("Error handling game selection:", error);
      toast.error("שגיאה בבחירת המשחק");
    }
  };

  const handleDeleteGame = async (e: React.MouseEvent, gameId: string, matchId?: string) => {
    e.stopPropagation();
    
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      
      if (matchId) {
        const { error: actionsError } = await supabase
          .from("match_actions")
          .delete()
          .eq("match_id", matchId);

        if (actionsError) {
          console.error("Error deleting match actions:", actionsError);
        }

        const { error: notesError } = await supabase
          .from("match_notes")
          .delete()
          .eq("match_id", matchId);

        if (notesError) {
          console.error("Error deleting match notes:", notesError);
        }

        const { error: subsError } = await supabase
          .from("match_substitutions")
          .delete()
          .eq("match_id", matchId);

        if (subsError) {
          console.error("Error deleting substitutions:", subsError);
        }

        const { error: matchError } = await supabase
          .from("matches")
          .delete()
          .eq("id", matchId);

        if (matchError) {
          console.error("Error deleting match:", matchError);
          throw matchError;
        }
      }

      const { error: reportError } = await supabase
        .from("pre_match_reports")
        .delete()
        .eq("id", gameId);

      if (reportError) {
        console.error("Error deleting pre-match report:", reportError);
        throw reportError;
      }

      setGames(prevGames => prevGames.filter(game => game.id !== gameId));
      toast.success("המשחק נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting game:", error);
      toast.error("שגיאה במחיקת המשחק");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNewGame = () => {
    navigate("/pre-match-report");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-right">בחר משחק למעקב</h1>
      
      <div className="space-y-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onSelect={handleGameSelect}
            onDelete={handleDeleteGame}
            isDeleting={isDeleting}
          />
        ))}

        {games.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            לא נמצאו משחקים. צור משחק חדש כדי להתחיל.
          </div>
        )}

        <Button 
          className="w-full mt-4"
          onClick={handleNewGame}
        >
          צור משחק חדש
        </Button>
      </div>
    </div>
  );
};