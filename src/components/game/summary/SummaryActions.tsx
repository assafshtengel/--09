import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Send, Mail, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const handleInstagramShare = async () => {
    try {
      const element = document.getElementById("game-summary-content");
      if (!element) return;

      const canvas = await html2canvas(element);
      const imageData = canvas.toDataURL("image/png");

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
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשתף לאינסטגרם כרגע",
        variant: "destructive",
      });
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
            onClick={handleInstagramShare}
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