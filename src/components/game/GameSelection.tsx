import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";

export const GameSelection = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Array<{
    id: string;
    match_date: string;
    opponent: string | null;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          .select("id, match_date, opponent")
          .eq("player_id", user.id)
          .eq("status", "completed")
          .order("match_date", { ascending: false })
          .limit(3);

        if (error) throw error;
        setGames(data || []);
      } catch (error) {
        console.error("Error fetching games:", error);
        toast.error("שגיאה בטעינת המשחקים");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [navigate]);

  const handleGameSelect = async (gameId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Check if a match already exists for this pre-match report
      const { data: existingMatch, error: matchError } = await supabase
        .from("matches")
        .select("id")
        .eq("pre_match_report_id", gameId)
        .maybeSingle();

      if (matchError) throw matchError;

      if (existingMatch?.id) {
        navigate(`/match/${existingMatch.id}`);
      } else {
        // Create a new match
        const { data: game } = await supabase
          .from("pre_match_reports")
          .select("match_date, opponent, actions")
          .eq("id", gameId)
          .single();

        if (game) {
          const { data: newMatch, error: createError } = await supabase
            .from("matches")
            .insert({
              match_date: game.match_date,
              opponent: game.opponent,
              pre_match_report_id: gameId,
              player_id: user.id,  // Add player_id here
              status: "preview"
            })
            .select()
            .single();

          if (createError) throw createError;
          if (newMatch) {
            navigate(`/match/${newMatch.id}`);
          }
        }
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
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleGameSelect(game.id)}
          >
            <CardHeader>
              <CardTitle className="text-right">
                {format(new Date(game.match_date), "dd/MM/yyyy", { locale: he })}
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