import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PreMatchHeader } from "./summary/PreMatchHeader";
import { PreMatchContent } from "./summary/PreMatchContent";
import { PreMatchActions } from "./summary/PreMatchActions";

interface PreMatchSummaryViewProps {
  matchDate: string;
  opponent?: string;
  position?: string;
  havaya: string;
  actions: Array<{ name: string; goal?: string }>;
  answers: Record<string, string>;
}

export const PreMatchSummaryView = ({
  matchDate,
  opponent,
  position,
  havaya,
  actions,
  answers,
}: PreMatchSummaryViewProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    console.log("PreMatchSummaryView props:", {
      matchDate,
      opponent,
      position,
      havaya,
      actions,
      answers,
    });
  }, [matchDate, opponent, position, havaya, actions, answers]);

  const handlePrint = () => {
    window.print();
  };

  const handleScreenshot = async () => {
    try {
      const element = document.getElementById('pre-match-summary');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `pre-match-summary-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "צילום מסך נשמר בהצלחה",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast({
        title: "שגיאה בשמירת צילום המסך",
        variant: "destructive",
      });
    }
  };

  const sendEmail = async (recipient: 'coach' | 'user') => {
    try {
      setIsSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("משתמש לא מחובר");

      const { data: profile } = await supabase
        .from('profiles')
        .select('coach_email, email')
        .eq('id', user.id)
        .single();

      if (recipient === 'coach' && !profile?.coach_email) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מייל של המאמן בפרופיל",
          variant: "destructive",
        });
        return;
      }

      const emailTo = recipient === 'coach' ? profile?.coach_email : profile?.email;
      
      const htmlContent = `
        <div dir="rtl">
          <h1>דוח טרום משחק</h1>
          ${document.getElementById('pre-match-summary')?.innerHTML}
        </div>
      `;

      const { error } = await supabase.functions.invoke('send-pre-match-report', {
        body: {
          to: [emailTo],
          subject: `דוח טרום משחק - ${format(new Date(matchDate), 'dd/MM/yyyy')}`,
          html: htmlContent,
        },
      });

      if (error) throw error;

      toast({
        title: "הדוח נשלח בהצלחה",
        description: `הדוח נשלח ל${recipient === 'coach' ? 'מאמן' : 'מייל שלך'}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה בשליחת המייל",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const shareToSocial = async (platform: 'facebook' | 'instagram') => {
    const shareText = `דוח טרום משחק - ${format(new Date(matchDate), 'dd/MM/yyyy')}\n` +
      `${opponent ? `נגד ${opponent}` : ''}\n` +
      `הוויה נבחרת: ${havaya}\n` +
      `מספר פעולות: ${actions.length}`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'instagram') {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "טקסט הועתק ללוח",
        description: "כעת תוכל להדביק אותו באינסטגרם",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div id="pre-match-summary" className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
        <PreMatchHeader 
          matchDate={matchDate}
          opponent={opponent}
          position={position}
        />
        <PreMatchContent
          havaya={havaya}
          actions={actions}
          answers={answers}
        />
      </div>

      <PreMatchActions
        onPrint={handlePrint}
        onScreenshot={handleScreenshot}
        onSendEmail={sendEmail}
        onShareSocial={shareToSocial}
        onNavigateHome={() => navigate('/dashboard')}
        isSending={isSending}
      />
    </div>
  );
};