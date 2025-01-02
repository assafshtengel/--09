import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Action } from "@/components/ActionSelector";
import { MatchDetailsSection } from "./summary/MatchDetailsSection";
import { ActionsSummarySection } from "./summary/ActionsSummarySection";
import { PerformanceRatingTable } from "./summary/PerformanceRatingTable";
import { SummaryActions } from "./summary/SummaryActions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
      if (!matchId) return;

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

  const handlePerformanceRatingChange = (aspect: string, rating: number) => {
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
        .select("coach_email, email")
        .eq("id", profile.user.id)
        .single();

      if (!playerProfile?.coach_email && !playerProfile?.email) {
        toast({
          title: "שגיאה",
          description: "לא נמצאו כתובות מייל",
          variant: "destructive",
        });
        return;
      }

      const recipients = [
        playerProfile.coach_email,
        playerProfile.email
      ].filter(Boolean);

      const { error } = await supabase.functions.invoke("send-game-summary", {
        body: {
          to: recipients,
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

  const handleShareSocial = async (platform: 'facebook' | 'instagram') => {
    try {
      const element = document.getElementById("game-summary-content");
      if (!element) return;

      const canvas = await html2canvas(element);
      const imageData = canvas.toDataURL("image/png");

      if (platform === 'instagram') {
        // Create a temporary link to download the image
        const link = document.createElement("a");
        link.href = imageData;
        link.download = "game-summary.png";
        link.click();

        // Open Instagram with a pre-filled message
        const instagramUrl = `https://www.instagram.com/create/story?caption=${encodeURIComponent(
          "Just finished my game! Check out my performance stats using @socr_app\n\nJoin me at https://socr.co.il"
        )}`;
        window.open(instagramUrl, '_blank');

        toast({
          title: "תמונה נשמרה",
          description: "כעת תוכל להעלות את התמונה לאינסטגרם",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשתף כרגע",
        variant: "destructive",
      });
    }
  };

  if (!matchData) {
    return <div>טוען...</div>;
  }

  return (
    <div className="h-[80vh] flex flex-col">
      <ScrollArea className="flex-1">
        <div id="game-summary-content" className="space-y-6 p-4">
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
      </ScrollArea>

      <div className="border-t p-4 bg-background">
        <SummaryActions
          gamePhase={gamePhase}
          isSendingEmail={isSendingEmail}
          onSubmit={() => {}}
          onSendEmail={handleSendEmail}
          onShareSocial={handleShareSocial}
          onScreenshot={handleScreenshot}
          onClose={onClose}
          onContinueGame={onContinue}
          matchId={matchId}
        />
      </div>
    </div>
  );
};