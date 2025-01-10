import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { Mail, Printer, Instagram, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { useState } from "react";
import { InstagramPreMatchSummary } from "./InstagramPreMatchSummary";
import { PreMatchCaptionPopup } from "./PreMatchCaptionPopup";
import { ObserverLinkDialog } from "./ObserverLinkDialog";

interface PreMatchSummaryProps {
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
  };
  actions: Action[];
  answers: Record<string, string>;
  havaya: string[];
  aiInsights: string[];
  onFinish: () => void;
  observerToken?: string;
}

export const PreMatchSummary = ({
  matchDetails,
  actions,
  answers,
  havaya,
  aiInsights,
  onFinish,
  observerToken
}: PreMatchSummaryProps) => {
  const { toast } = useToast();
  const [showInstagramSummary, setShowInstagramSummary] = useState(false);
  const [showCaptionPopup, setShowCaptionPopup] = useState(false);
  const [showObserverLink, setShowObserverLink] = useState(false);
  const [reportId, setReportId] = useState<string>();
  
  const sendEmail = async (recipientType: 'user' | 'coach') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, coach_email')
        .eq('id', user.id)
        .single();

      const coachEmail = profile?.coach_email;
      if (recipientType === 'coach' && !coachEmail) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מייל של המאמן בפרופיל",
          variant: "destructive",
        });
        return;
      }

      const playerName = profile?.full_name || "שחקן";

      // Add observer link to email content if available
      const observerLinkSection = observerToken ? `
        <div>
          <h3>קישור למשקיף</h3>
          <p>קישור למעקב אחר המשחק בזמן אמת: ${window.location.origin}/observe/${observerToken}</p>
        </div>
      ` : '';

      const htmlContent = `
        <div dir="rtl">
          <h2>דוח טרום משחק - ${playerName}</h2>
          <div>
            <h3>פרטי המשחק</h3>
            <p>תאריך: ${format(new Date(matchDetails.date), 'dd/MM/yyyy')}</p>
            ${matchDetails.opponent ? `<p>נגד: ${matchDetails.opponent}</p>` : ''}
          </div>
          
          ${observerLinkSection}

          <div>
            <h3>הוויות נבחרות</h3>
            <p>${havaya.join(' • ')}</p>
          </div>

          <div>
            <h3>יעדים למשחק</h3>
            <ul>
              ${actions.map(action => `
                <li>
                  ${action.name}
                  ${action.goal ? `<br>יעד: ${action.goal}` : ''}
                </li>
              `).join('')}
            </ul>
          </div>

          <div>
            <h3>תשובות לשאלות</h3>
            ${Object.entries(answers).map(([question, answer]) => `
              <div>
                <p><strong>${question}</strong></p>
                <p>${answer}</p>
              </div>
            `).join('')}
          </div>

          ${aiInsights.length > 0 ? `
            <div>
              <h3>תובנות AI</h3>
              <ul>
                ${aiInsights.map(insight => `<li>${insight}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;

      const { error } = await supabase.functions.invoke('send-pre-match-report', {
        body: {
          to: recipientType === 'coach' ? [coachEmail] : [user.email],
          subject: `דוח טרום משחק - ${playerName} - ${format(new Date(matchDetails.date), 'dd/MM/yyyy')}`,
          html: htmlContent,
        },
      });

      if (error) throw error;

      toast({
        title: "הדוח נשלח בהצלחה",
        description: recipientType === 'coach' ? "הדוח נשלח למאמן" : "הדוח נשלח למייל שלך",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה בשליחת המייל",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const shareToInstagram = () => {
    setShowInstagramSummary(true);
  };

  return (
    <div className="space-y-6">
      {observerToken && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-blue-700">קישור למשקיף</h3>
            <Button
              variant="outline"
              onClick={() => setShowObserverLink(true)}
              className="flex items-center gap-2"
            >
              <Link className="h-4 w-4" />
              הצג קישור
            </Button>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            שתף קישור זה עם המשקיף כדי לאפשר מעקב בזמן אמת אחר המשחק
          </p>
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
        <Button onClick={onFinish}>סיים</Button>
      </div>

      {observerToken && (
        <ObserverLinkDialog
          open={showObserverLink}
          onOpenChange={setShowObserverLink}
          observerToken={observerToken}
        />
      )}

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
