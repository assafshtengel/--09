import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { Mail, Printer, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { useState } from "react";
import { InstagramPreMatchSummary } from "./InstagramPreMatchSummary";
import { PreMatchCaptionPopup } from "./PreMatchCaptionPopup";
import { useNavigate } from "react-router-dom";

interface PreMatchSummaryProps {
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
    match_type?: string;
  };
  actions: Action[];
  answers: Record<string, string>;
  havaya: string[];
  aiInsights: string[];
  onFinish: () => void;
}

export const PreMatchSummary = ({
  matchDetails,
  actions,
  answers,
  havaya,
  aiInsights,
  onFinish,
}: PreMatchSummaryProps) => {
  const { toast } = useToast();
  const [showInstagramSummary, setShowInstagramSummary] = useState(false);
  const [showCaptionPopup, setShowCaptionPopup] = useState(false);
  const [reportId, setReportId] = useState<string>();
  const navigate = useNavigate();

  const sendEmail = async (recipient: 'coach' | 'user') => {
    try {
      const element = document.getElementById('pre-match-summary');
      if (!element) return;

      const canvas = await html2canvas(element);
      const imageData = canvas.toDataURL('image/png');

      // Get user profile to get coach's email if sending to coach
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('coach_email, email')
        .eq('id', user.id)
        .single();

      const emailTo = recipient === 'coach' ? profile?.coach_email : profile?.email;
      if (!emailTo) {
        toast({
          title: recipient === 'coach' ? "אימייל המאמן לא נמצא" : "אימייל המשתמש לא נמצא",
          description: "בדוק את הגדרות הפרופיל",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke('send-pre-match-report', {
        body: {
          email: emailTo,
          imageData,
          matchDetails,
        },
      });

      if (error) throw error;

      toast({
        title: "הדוח נשלח בהצלחה",
        description: `נשלח ל${recipient === 'coach' ? 'מאמן' : 'מייל שלך'}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה בשליחת הדוח",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async () => {
    try {
      const element = document.getElementById('pre-match-summary');
      if (!element) return;

      const canvas = await html2canvas(element);
      const imageUrl = canvas.toDataURL('image/png');

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "שגיאה",
          description: "לא ניתן לפתוח חלון הדפסה",
          variant: "destructive",
        });
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Pre-Match Summary</title>
          </head>
          <body style="margin: 0;">
            <img src="${imageUrl}" style="width: 100%;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Error printing:', error);
      toast({
        title: "שגיאה בהדפסה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const shareToInstagram = () => {
    setShowInstagramSummary(true);
  };

  const handleFinish = async () => {
    try {
      await onFinish();
      navigate('/pre-game-planner');
      toast({
        title: "הדוח נשמר בהצלחה",
        description: "מועבר לתכנון 24 שעות לפני המשחק",
      });
    } catch (error) {
      console.error('Error completing report:', error);
      toast({
        title: "שגיאה בשמירת הדוח",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div id="pre-match-summary">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">סיכום דוח טרום משחק</h2>
          <p className="text-muted-foreground">
            תאריך: {matchDetails.date}
            {matchDetails.opponent && ` | נגד: ${matchDetails.opponent}`}
            {matchDetails.match_type && ` | סוג משחק: ${matchDetails.match_type}`}
          </p>
        </div>

        {havaya.length > 0 && (
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">הוויות נבחרות</h3>
            <div className="flex flex-wrap gap-2">
              {havaya.map((h, index) => (
                <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-2">יעדים למשחק</h3>
          <ul className="space-y-2">
            {actions.map((action, index) => (
              <li key={index} className="border p-2 rounded">
                {action.name}
                {action.goal && <div className="text-sm">יעד: {action.goal}</div>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">תשובות לשאלות</h3>
          <div className="space-y-4">
            {Object.entries(answers).map(([question, answer], index) => (
              <div key={index} className="border p-3 rounded">
                <p className="font-medium">{question}</p>
                <p className="text-muted-foreground">{answer}</p>
              </div>
            ))}
          </div>
        </div>

        {aiInsights.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">תובנות AI</h3>
            <ul className="space-y-2">
              {aiInsights.map((insight, index) => (
                <li key={index} className="text-muted-foreground">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 justify-end print:hidden">
        <Button onClick={() => sendEmail('coach')} variant="outline" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          שלח למאמן
        </Button>
        <Button onClick={() => sendEmail('user')} variant="outline" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          שלח למייל שלי
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          הדפס
        </Button>
        <Button 
          onClick={() => setShowCaptionPopup(true)} 
          variant="outline"
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100"
        >
          <Instagram className="h-4 w-4" />
          צור טקסט לאינסטגרם
        </Button>
        <Button onClick={shareToInstagram} variant="outline" className="flex items-center gap-2">
          <Instagram className="h-4 w-4" />
          שתף באינסטגרם
        </Button>
        <Button onClick={handleFinish}>סיים</Button>
      </div>

      {showInstagramSummary && (
        <InstagramPreMatchSummary
          matchDetails={matchDetails}
          actions={actions}
          havaya={havaya}
          onClose={() => setShowInstagramSummary(false)}
          onShare={() => {
            setShowInstagramSummary(false);
            toast({
              title: "התמונה הורדה בהצלחה",
              description: "כעת תוכל להעלות אותה לאינסטגרם",
            });
          }}
        />
      )}

      {showCaptionPopup && (
        <PreMatchCaptionPopup
          isOpen={showCaptionPopup}
          onClose={() => setShowCaptionPopup(false)}
          reportId={reportId}
        />
      )}
    </div>
  );
};