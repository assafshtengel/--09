import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Action } from "@/components/ActionSelector";
import { MatchDetailsSection } from "./summary/MatchDetailsSection";
import { ActionsSummarySection } from "./summary/ActionsSummarySection";
import { PerformanceRatingTable } from "./summary/PerformanceRatingTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

interface GameSummaryProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    minute: number;
    result: "success" | "failure";
    note?: string;
  }>;
  generalNotes: Array<{ text: string; minute: number }>;
  onClose: () => void;
  gamePhase: "halftime" | "ended";
  havaya?: string[];
  onContinue?: () => void;
  matchId: string;
}

export const GameSummary = ({
  actions,
  actionLogs,
  generalNotes,
  onClose,
  gamePhase,
  havaya = [],
  onContinue,
  matchId,
}: GameSummaryProps) => {
  const { toast } = useToast();
  const [matchData, setMatchData] = useState<any>(null);
  const [performanceRatings, setPerformanceRatings] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const fetchMatchData = async () => {
      if (!matchId) {
        console.error("No match ID provided");
        return;
      }

      try {
        const { data: match, error } = await supabase
          .from("matches")
          .select(`
            *,
            match_mental_feedback (*)
          `)
          .eq("id", matchId)
          .maybeSingle();

        if (error) throw error;
        setMatchData(match);
      } catch (error) {
        console.error("Error fetching match data:", error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את נתוני המשחק",
          variant: "destructive",
        });
      }
    };

    fetchMatchData();
  }, [matchId]);

  const handlePerformanceRatingChange = async (aspect: string, rating: number) => {
    setPerformanceRatings(prev => ({ ...prev, [aspect]: rating }));
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const element = document.getElementById("game-summary-content");
      if (!element) return;

      const canvas = await html2canvas(element);
      const imageData = canvas.toDataURL("image/png");

      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("User not found");

      const { data: playerProfile } = await supabase
        .from("profiles")
        .select("coach_email")
        .eq("id", profile.user.id)
        .single();

      if (!playerProfile?.coach_email) {
        toast({
          title: "שגיאה",
          description: "לא נמצא אימייל של המאמן",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke("send-game-summary", {
        body: {
          to: [playerProfile.coach_email],
          subject: `סיכום משחק - ${matchData?.match_date}`,
          html: `
            <div dir="rtl">
              <h1>סיכום משחק</h1>
              <p>מצורף סיכום המשחק מתאריך ${matchData?.match_date}</p>
              <img src="${imageData}" alt="Game Summary" style="max-width: 100%;" />
            </div>
          `,
        },
      });

      if (error) throw error;

      toast({
        title: "נשלח בהצלחה",
        description: "סיכום המשחק נשלח למייל",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח את הסיכום במייל",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleScreenshot = async () => {
    try {
      const element = document.getElementById("game-summary-content");
      if (!element) return;

      const canvas = await html2canvas(element);
      const link = document.createElement("a");
      link.download = `game-summary-${matchData?.match_date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "צילום מסך נשמר",
        description: "הקובץ נשמר בהצלחה",
      });
    } catch (error) {
      console.error("Error taking screenshot:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור צילום מסך",
        variant: "destructive",
      });
    }
  };

  if (!matchData) {
    return <div>טוען...</div>;
  }

  return (
    <div className="h-[80vh] overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto px-4">
        <div id="game-summary-content" className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-right">
              {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
            </h2>
          </div>

          <MatchDetailsSection matchData={matchData} />
          <ActionsSummarySection actions={actions} actionLogs={actionLogs} />
          
          {gamePhase === "ended" && (
            <PerformanceRatingTable
              ratings={performanceRatings}
              onRatingChange={handlePerformanceRatingChange}
            />
          )}

          {generalNotes.length > 0 && (
            <div className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-right">הערות כלליות</h3>
              <div className="space-y-2">
                {generalNotes.map((note, index) => (
                  <div key={index} className="text-right">
                    <span className="text-sm text-muted-foreground">{note.minute}'</span>
                    <p>{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4 bg-background flex flex-wrap justify-end gap-4">
        {gamePhase === "halftime" && onContinue && (
          <Button onClick={() => {
            onContinue();
            onClose();
          }}>
            התחל מחצית שנייה
          </Button>
        )}

        {gamePhase === "ended" && (
          <>
            <Button
              onClick={handleSendEmail}
              variant="outline"
              disabled={isSendingEmail}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSendingEmail ? "שולח..." : "שלח למאמן"}
            </Button>
            <Button
              onClick={handleScreenshot}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              שמור צילום מסך
            </Button>
          </>
        )}
        
        <Button onClick={onClose} variant="outline">
          סגור
        </Button>
      </div>
    </div>
  );
};