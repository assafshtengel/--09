import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
  match_date: string;
  opponent: string | null;
  match_id?: string;
  status: "completed" | "preview";
}

export const GameSelection = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }

        // Fetch pre-match reports and their associated matches
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
          .order("match_date", { ascending: false })
          .limit(3);

        if (error) throw error;

        const formattedGames: Game[] = (data || []).map(game => ({
          id: game.id,
          match_date: game.match_date,
          opponent: game.opponent,
          match_id: game.matches?.[0]?.id,
          // Ensure status is either "completed" or "preview"
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
        // Navigate to existing match summary
        navigate(`/match/${game.match_id}`);
        return;
      }

      // Create a new match for non-completed games
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

  const handleNewGame = () => {
    navigate("/pre-match-report");
  };

  if (isLoading) {
    return <div className="text-center p-8">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-right">בחר משחק למעקב</h1>
      
      <div className="space-y-4">
        {games.map((game) => (
          <Card 
            key={game.id}
            className={cn(
              "cursor-pointer hover:shadow-lg transition-shadow",
              game.status === "completed" ? "bg-red-100" : ""
            )}
            onClick={() => handleGameSelect(game)}
          >
            <CardHeader>
              <CardTitle className="text-right flex justify-between items-center">
                <span>{format(new Date(game.match_date), "dd/MM/yyyy", { locale: he })}</span>
                {game.status === "completed" && (
                  <span className="text-sm text-red-600">הושלם</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-right">
                נגד: {game.opponent || "לא צוין"}
              </p>
            </CardContent>
          </Card>
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