import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Facebook, Home, Instagram, Mail, Printer, Send } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

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
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-right">דוח טרום משחק</h2>
          <p className="text-muted-foreground text-right">
            תאריך: {format(new Date(matchDate), 'dd/MM/yyyy')}
            {opponent && ` | נגד: ${opponent}`}
            {position && ` | תפקיד: ${position}`}
          </p>
        </div>

        {havaya && (
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-right">הוויה נבחרת</h3>
            <p className="text-xl font-bold text-right">{havaya}</p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-2 text-right">פעולות ({actions.length})</h3>
          <ScrollArea className="h-[200px]">
            <ul className="space-y-2">
              {actions.map((action, index) => (
                <li key={index} className="border p-2 rounded text-right">
                  {action.name}
                  {action.goal && <div className="text-sm text-muted-foreground">יעד: {action.goal}</div>}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-right">תשובות לשאלות</h3>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {Object.entries(answers).map(([question, answer], index) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-medium text-right">{question}</p>
                  <p className="text-muted-foreground text-right">{answer}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-end">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" />
          הדפס
        </Button>
        <Button onClick={handleScreenshot} variant="outline" className="gap-2">
          <Camera className="h-4 w-4" />
          צלם מסך
        </Button>
        <Button 
          onClick={() => sendEmail('coach')} 
          variant="outline" 
          disabled={isSending}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {isSending ? "שולח..." : "שלח למאמן"}
        </Button>
        <Button 
          onClick={() => sendEmail('user')} 
          variant="outline" 
          disabled={isSending}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          שלח למייל שלי
        </Button>
        <Button
          onClick={() => shareToSocial('facebook')}
          variant="outline"
          className="gap-2"
        >
          <Facebook className="h-4 w-4" />
          שתף בפייסבוק
        </Button>
        <Button
          onClick={() => shareToSocial('instagram')}
          variant="outline"
          className="gap-2"
        >
          <Instagram className="h-4 w-4" />
          שתף באינסטגרם
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          חזרה לדף הבית
        </Button>
      </div>
    </div>
  );
};