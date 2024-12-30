import { Button } from "@/components/ui/button";
import { Share2, Send } from "lucide-react";
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

  const handleWhatsAppShare = async () => {
    try {
      setIsSendingWhatsApp(true);
      
      // Get user's profile to get coach's phone number
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("משתמש לא מחובר");

      const { data: profile } = await supabase
        .from('profiles')
        .select('coach_phone_number')
        .eq('id', user.id)
        .single();

      if (!profile?.coach_phone_number) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מספר טלפון של המאמן בפרופיל",
          variant: "destructive",
        });
        return;
      }

      // Get match details and summary
      const { data: match } = await supabase
        .from('matches')
        .select(`
          match_date,
          opponent,
          match_actions (
            action_id,
            result
          )
        `)
        .eq('id', matchId)
        .single();

      if (!match) throw new Error("לא נמצאו פרטי משחק");

      const successCount = match.match_actions?.filter((action: any) => action.result === 'success').length || 0;
      const totalActions = match.match_actions?.length || 0;
      const successRate = totalActions > 0 ? Math.round((successCount / totalActions) * 100) : 0;

      const summaryText = `סיכום משחק מ-${match.match_date}${match.opponent ? ` מול ${match.opponent}` : ''}\n` +
        `אחוז הצלחה: ${successRate}%\n` +
        `פעולות מוצלחות: ${successCount}/${totalActions}`;

      const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          message: summaryText,
          recipientNumber: profile.coach_phone_number
        }
      });

      if (whatsappError) throw whatsappError;

      toast({
        title: "נשלח בהצלחה",
        description: "סיכום המשחק נשלח למאמן",
      });

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: "לא הצלחנו לשלוח את ההודעה למאמן",
        variant: "destructive",
      });
    } finally {
      setIsSendingWhatsApp(false);
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
          >
            {isSendingEmail ? "שולח..." : "שלח למייל"}
          </Button>
          <Button
            onClick={handleWhatsAppShare}
            variant="outline"
            disabled={isSendingWhatsApp}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSendingWhatsApp ? "שולח..." : "שלח למאמן"}
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => onShareSocial('facebook')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              שתף בפייסבוק
            </Button>
            <Button
              onClick={() => onShareSocial('instagram')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              שתף באינסטגרם
            </Button>
          </div>
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