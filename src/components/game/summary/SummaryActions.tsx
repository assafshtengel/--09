import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Send, Mail, Instagram, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface SummaryActionsProps {
  gamePhase: "halftime" | "ended";
  isSendingEmail: boolean;
  onSubmit: () => void;
  onSendEmail: () => void;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  onScreenshot: () => void;
  onClose: () => void;
  onContinueGame?: () => void;
  matchId?: string;
}

export const SummaryActions = ({
  gamePhase,
  isSendingEmail,
  onSubmit,
  onSendEmail,
  onShareSocial,
  onScreenshot,
  onClose,
  onContinueGame,
  matchId
}: SummaryActionsProps) => {
  const { toast } = useToast();
  const [isSendingToCoach, setIsSendingToCoach] = useState(false);

  const handleSendToCoach = async () => {
    try {
      setIsSendingToCoach(true);
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
          description: "לא נמצאה כתובת מייל של המאמן",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke("send-game-summary", {
        body: {
          to: [playerProfile.coach_email],
          subject: "סיכום משחק מתלמיד",
          html: `
            <div dir="rtl">
              <h1>סיכום משחק</h1>
              <p>שלום מאמן,</p>
              <p>מצורף סיכום המשחק שלי.</p>
              <img src="${imageData}" alt="Game Summary" style="max-width: 100%;" />
            </div>
          `,
        },
      });

      if (error) throw error;

      toast({
        title: "נשלח בהצלחה",
        description: "סיכום המשחק נשלח למאמן",
      });
    } catch (error) {
      console.error("Error sending email to coach:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח את הסיכום למאמן",
        variant: "destructive",
      });
    } finally {
      setIsSendingToCoach(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-4">
      {gamePhase === "halftime" && onContinueGame && (
        <Button onClick={() => {
          onContinueGame();
          onClose();
        }} variant="default">
          המשך למחצית שנייה
        </Button>
      )}
      
      {gamePhase === "ended" && (
        <>
          <Button 
            onClick={onSubmit}
            variant="default"
          >
            שמור וסיים
          </Button>
          <Button 
            onClick={onSendEmail} 
            variant="outline"
            disabled={isSendingEmail}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            {isSendingEmail ? "שולח..." : "שלח למייל"}
          </Button>
          <Button
            onClick={handleSendToCoach}
            variant="outline"
            disabled={isSendingToCoach}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            {isSendingToCoach ? "שולח למאמן..." : "שלח למאמן"}
          </Button>
          <Button
            onClick={() => onShareSocial('instagram')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Instagram className="h-4 w-4" />
            שתף באינסטגרם
          </Button>
        </>
      )}
      
      <Button onClick={onScreenshot} variant="outline">
        שמור צילום מסך
      </Button>
      <Button onClick={onClose} variant="outline">
        סגור
      </Button>
    </div>
  );
};