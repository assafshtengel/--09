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

  const formatEmailContent = (element: HTMLElement) => {
    const matchDetails = element.querySelector('[data-section="match-details"]');
    const actionsSummary = element.querySelector('[data-section="actions-summary"]');
    const performanceRatings = element.querySelector('[data-section="performance-ratings"]');
    const generalNotes = element.querySelector('[data-section="general-notes"]');

    return `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="color: #2563eb; margin-bottom: 1rem;">סיכום משחק</h1>
        
        ${matchDetails ? matchDetails.innerHTML : ''}
        
        ${actionsSummary ? `
          <div style="margin-top: 2rem;">
            <h2 style="color: #374151;">סיכום פעולות</h2>
            ${actionsSummary.innerHTML}
          </div>
        ` : ''}
        
        ${performanceRatings ? `
          <div style="margin-top: 2rem;">
            <h2 style="color: #374151;">דירוג ביצועים</h2>
            ${performanceRatings.innerHTML}
          </div>
        ` : ''}
        
        ${generalNotes ? `
          <div style="margin-top: 2rem;">
            <h2 style="color: #374151;">הערות כלליות</h2>
            ${generalNotes.innerHTML}
          </div>
        ` : ''}
        
        <div style="margin-top: 2rem; color: #6b7280; font-size: 0.875rem;">
          <p>נשלח באמצעות מערכת SOCR</p>
        </div>
      </div>
    `;
  };

  const handleSendToCoach = async () => {
    try {
      setIsSendingToCoach(true);
      const element = document.getElementById("game-summary-content");
      if (!element) return;

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

      const emailContent = formatEmailContent(element);

      const { error } = await supabase.functions.invoke("send-game-summary", {
        body: {
          to: [playerProfile.coach_email],
          subject: "סיכום משחק מתלמיד",
          html: emailContent,
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