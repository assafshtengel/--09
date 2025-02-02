import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Eye, RefreshCw, Target, ChartBar, Trash2, PlayCircle } from "lucide-react";
import { GameHistoryItem } from "@/components/game/history/types";

const GAMES_PER_PAGE = 5;

const GameHistory = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async (fromStart: boolean = true) => {
    try {
      setIsLoadingMore(!fromStart);
      setIsLoading(fromStart);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const currentPage = fromStart ? 0 : page;
      const start = currentPage * GAMES_PER_PAGE;

      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          match_date,
          opponent,
          status,
          pre_match_report:pre_match_report_id (
            actions,
            questions_answers,
            havaya
          )
        `)
        .eq("player_id", user.id)
        .order("match_date", { ascending: false })
        .range(start, start + GAMES_PER_PAGE - 1);

      if (error) throw error;

      const transformedData: GameHistoryItem[] = data.map(item => ({
        id: item.id,
        match_date: item.match_date,
        opponent: item.opponent,
        status: item.status,
        pre_match_report: item.pre_match_report
      }));

      if (fromStart) {
        setGames(transformedData);
      } else {
        setGames(prev => [...prev, ...transformedData]);
      }

      setHasMore(data.length === GAMES_PER_PAGE);
      if (!fromStart) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("שגיאה בטעינת המשחקים");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
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
                    {format(new Date(game.match_date), "dd/MM/yyyy", { locale: he })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {game.status === 'ended' ? 'הסתיים' : 
                     game.status === 'preview' ? 'טרם התחיל' : 
                     'בתהליך'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {/* Add new button for GameTracker */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/game/${game.id}`)}
                    title="מעקב משחק"
                  >
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/match/${game.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/pre-match-report/${game.id}`)}
                  >
                    <Target className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/game-summary/${game.id}`)}
                  >
                    <ChartBar className="h-4 w-4" />
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

      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => fetchGames(false)}
            disabled={isLoadingMore}
            className="w-full max-w-xs"
          >
            {isLoadingMore ? "טוען..." : "טען משחקים נוספים"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameHistory;