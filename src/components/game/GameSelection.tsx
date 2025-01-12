import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Game {
  match_id?: string;
  opponent: string;
  status: string;
  match_date: string;
  location?: string;
}

export const GameSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGames(matches || []);
    } catch (error) {
      console.error("Error loading games:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את רשימת המשחקים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameSelect = async (game: Game) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // If game already exists, navigate to it
      if (game.match_id) {
        navigate(`/game/${game.match_id}`);
        return;
      }

      // Create new match if one doesn't exist
      const { data: newMatch, error: createError } = await supabase
        .from('matches')
        .insert([
          {
            player_id: user.id,
            opponent: game.opponent,
            match_date: game.match_date,
            location: game.location,
            status: 'preview'
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      if (newMatch) {
        navigate(`/game/${newMatch.id}`);
      }
    } catch (error) {
      console.error("Error handling game selection:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לבחור משחק",
        variant: "destructive",
      });
    }
  };

  const handleNewGame = () => {
    navigate("/pre-game-planner");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">בחירת משחק</h1>
        <Button onClick={handleNewGame}>
          משחק חדש
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {games.map((game, index) => (
          <Card 
            key={index}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleGameSelect(game)}
          >
            <div className="text-right">
              <h3 className="font-semibold mb-2">{game.opponent}</h3>
              <p className="text-sm text-gray-600">
                {new Date(game.match_date).toLocaleDateString('he-IL')}
              </p>
              {game.location && (
                <p className="text-sm text-gray-600">{game.location}</p>
              )}
              <div className="mt-2">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  game.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {game.status === 'completed' ? 'הסתיים' : 'בתהליך'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};