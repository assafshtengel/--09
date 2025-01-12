import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, RefreshCw, Target, ChartBar } from "lucide-react";
import { GameHistoryItem } from "@/components/game/history/types";
import { GameDetailsDialog } from "@/components/game/history/GameDetailsDialog";
import { PreMatchGoalsDialog } from "@/components/game/history/PreMatchGoalsDialog";
import { GameSummaryDialog } from "@/components/game/history/GameSummaryDialog";

const GameHistory = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameHistoryItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          match_date,
          opponent,
          pre_match_report:pre_match_report_id (
            actions,
            questions_answers,
            havaya
          ),
          match_actions (*)
        `)
        .eq("player_id", user.id)
        .eq("status", "ended")
        .order("match_date", { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("שגיאה בטעינת המשחקים");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetGame = async (gameId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("match_actions")
        .delete()
        .eq("match_id", gameId);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from("matches")
        .update({ status: "preview" })
        .eq("id", gameId);

      if (updateError) throw updateError;

      toast.success("המשחק אופס בהצלחה");
      navigate(`/match/${gameId}`);
    } catch (error) {
      console.error("Error resetting game:", error);
      toast.error("שגיאה באיפוס המשחק");
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          חזרה לדשבורד
        </Button>
        <h1 className="text-2xl font-bold">היסטוריית משחקים</h1>
      </div>

      <div className="grid gap-4">
        {games.map((game) => (
          <Card key={game.id} className="hover:bg-gray-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1 text-right">
                  <h3 className="font-semibold">
                    {game.opponent ? `נגד ${game.opponent}` : "משחק"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(game.match_date).toLocaleDateString("he-IL")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedGame(game);
                      setShowDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedGame(game);
                      setShowGoalsDialog(true);
                    }}
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedGame(game);
                      setShowSummaryDialog(true);
                    }}
                  >
                    <ChartBar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleResetGame(game.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {games.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            לא נמצאו משחקים בהיסטוריה
          </div>
        )}
      </div>

      {selectedGame && (
        <>
          <GameDetailsDialog
            isOpen={showDetailsDialog}
            onClose={() => {
              setShowDetailsDialog(false);
              setSelectedGame(null);
            }}
            game={selectedGame}
          />
          <PreMatchGoalsDialog
            isOpen={showGoalsDialog}
            onClose={() => {
              setShowGoalsDialog(false);
              setSelectedGame(null);
            }}
            preMatchReport={selectedGame.pre_match_report}
          />
          <GameSummaryDialog
            isOpen={showSummaryDialog}
            onClose={() => {
              setShowSummaryDialog(false);
              setSelectedGame(null);
            }}
            game={selectedGame}
          />
        </>
      )}
    </div>
  );
};

export default GameHistory;