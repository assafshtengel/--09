import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { GameCard } from "./GameCard";
import { Game } from "@/types/game";

export const GameSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // First get all pre-match reports
      const { data: reports, error: reportsError } = await supabase
        .from('pre_match_reports')
        .select('*')
        .eq('player_id', user.id)
        .order('match_date', { ascending: false });

      if (reportsError) throw reportsError;

      // Then get matches that have these reports
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('player_id', user.id)
        .in('pre_match_report_id', reports?.map(r => r.id) || [])
        .order('match_date', { ascending: false });

      if (matchesError) throw matchesError;

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
      navigate(`/game/${game.id}`);
    } catch (error) {
      console.error("Error handling game selection:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לבחור משחק",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGame = async (e: React.MouseEvent, gameId: string, matchId?: string) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    try {
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .eq('id', gameId);

      if (deleteError) throw deleteError;

      setGames(prevGames => prevGames.filter(game => game.id !== gameId));
      
      toast({
        title: "נמחק בהצלחה",
        description: "המשחק נמחק בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את המשחק",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
          <div className="col-span-full text-center py-8 text-gray-500">
            לא נמצאו משחקים עם יעדים מוגדרים
          </div>
        )}
      </div>
    </div>
  );
};