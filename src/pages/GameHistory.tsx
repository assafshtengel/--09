import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Target, ChartBar, Mail, Printer, Instagram } from "lucide-react";
import { GameHistoryItem } from "@/components/game/history/types";
import { GameDetailsDialog } from "@/components/game/history/GameDetailsDialog";
import { PreMatchGoalsDialog } from "@/components/game/history/PreMatchGoalsDialog";
import { GameSummaryDialog } from "@/components/game/history/GameSummaryDialog";
import { format } from "date-fns";

const GameHistory = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameHistoryItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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

      // Fetch both completed matches and pre-match reports
      const { data: matchesData, error: matchesError } = await supabase
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
        .eq("status", "ended");

      if (matchesError) throw matchesError;

      const { data: preMatchData, error: preMatchError } = await supabase
        .from("pre_match_reports")
        .select(`
          id,
          match_date,
          opponent,
          actions,
          questions_answers,
          havaya
        `)
        .eq("player_id", user.id)
        .eq("status", "completed");

      if (preMatchError) throw preMatchError;

      // Combine both datasets
      const combinedData = [
        ...(matchesData || []),
        ...(preMatchData || []).map(report => ({
          id: report.id,
          match_date: report.match_date,
          opponent: report.opponent,
          pre_match_report: {
            actions: report.actions,
            questions_answers: report.questions_answers,
            havaya: report.havaya
          },
          isPreMatchOnly: true
        }))
      ];

      // Sort by date, most recent first
      combinedData.sort((a, b) => 
        new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
      );

      setGames(combinedData);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("שגיאה בטעינת המשחקים");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSend = async (gameId: string, recipientType: 'user' | 'coach') => {
    try {
      setIsSendingEmail(true);
      const game = games.find(g => g.id === gameId);
      if (!game) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("לא נמצא משתמש מחובר");
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, coach_email')
        .eq('id', user.id)
        .single();

      if (recipientType === 'coach' && !profile?.coach_email) {
        toast.error("לא נמצא מייל של המאמן בפרופיל");
        return;
      }

      const htmlContent = `
        <div dir="rtl">
          <h2>דוח טרום משחק - ${profile?.full_name || "שחקן"}</h2>
          <div>
            <h3>פרטי המשחק</h3>
            <p>תאריך: ${format(new Date(game.match_date), 'dd/MM/yyyy')}</p>
            ${game.opponent ? `<p>נגד: ${game.opponent}</p>` : ''}
          </div>
          
          ${game.pre_match_report?.havaya ? `
            <div>
              <h3>הוויות נבחרות</h3>
              <p>${game.pre_match_report.havaya}</p>
            </div>
          ` : ''}

          ${game.pre_match_report?.actions && Array.isArray(game.pre_match_report.actions) ? `
            <div>
              <h3>יעדים למשחק</h3>
              <ul>
                ${game.pre_match_report.actions.map((action: any) => `
                  <li>
                    ${action.name}
                    ${action.goal ? `<br>יעד: ${action.goal}` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          ${game.pre_match_report?.questions_answers ? `
            <div>
              <h3>תשובות לשאלות</h3>
              ${Object.entries(game.pre_match_report.questions_answers).map(([question, answer]) => `
                <div style="margin-bottom: 1rem;">
                  <p style="font-weight: bold;">${question}</p>
                  <p>${answer}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;

      const { error } = await supabase.functions.invoke('send-pre-match-report', {
        body: {
          to: recipientType === 'coach' ? [profile.coach_email] : [user.email],
          subject: `דוח טרום משחק - ${profile?.full_name || "שחקן"} - ${format(new Date(game.match_date), 'dd/MM/yyyy')}`,
          html: htmlContent,
        },
      });

      if (error) throw error;

      toast.success(recipientType === 'coach' ? "הדוח נשלח למאמן" : "הדוח נשלח למייל שלך");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("שגיאה בשליחת המייל");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
                  {!game.isPreMatchOnly && (
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
                  )}
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
                  {!game.isPreMatchOnly && (
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
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    title="שלח למייל שלי"
                    onClick={() => handleEmailSend(game.id, 'user')}
                    disabled={isSendingEmail}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="שלח למייל המאמן"
                    onClick={() => handleEmailSend(game.id, 'coach')}
                    disabled={isSendingEmail}
                    className="relative"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 text-xs font-bold bg-accent text-accent-foreground rounded-full w-4 h-4 flex items-center justify-center">
                      C
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedGame(game);
                      // Handle Instagram share
                    }}
                  >
                    <Instagram className="h-4 w-4" />
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