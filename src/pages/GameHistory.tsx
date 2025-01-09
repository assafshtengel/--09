import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { History, Eye, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GameHistoryItem {
  id: string;
  match_date: string;
  opponent: string | null;
  pre_match_report?: {
    actions: any[];
    questions_answers: any;
  };
  match_actions?: any[];
  match_notes?: any[];
}

const GameHistory = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameHistoryItem | null>(null);

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
            questions_answers
          ),
          match_actions:match_actions (*)
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
      // Delete existing match actions
      const { error: deleteError } = await supabase
        .from("match_actions")
        .delete()
        .eq("match_id", gameId);

      if (deleteError) throw deleteError;

      // Reset match status to preview
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>פרטי משחק</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 mt-4">
                        <div>
                          <h3 className="font-semibold mb-2">נתוני טרום משחק</h3>
                          {game.pre_match_report && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium">יעדים</h4>
                                <ul className="list-disc list-inside">
                                  {game.pre_match_report.actions.map((action: any, index: number) => (
                                    <li key={index}>
                                      {action.name} - יעד: {action.goal || "לא הוגדר"}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">נתוני משחק</h3>
                          {game.match_actions && game.match_actions.length > 0 ? (
                            <ul className="space-y-2">
                              {game.match_actions.map((action: any) => (
                                <li key={action.id} className="flex justify-between">
                                  <span>{action.result}</span>
                                  <span>דקה {action.minute}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground">אין נתוני משחק</p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
    </div>
  );
};

export default GameHistory;