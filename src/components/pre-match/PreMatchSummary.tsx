import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";
import { Badge } from "@/components/ui/badge";
import { SummaryActions } from "./components/SummaryActions";
import html2canvas from "html2canvas";

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
}

export const PreMatchSummary = ({
  matchDetails,
  actions,
  answers,
  havaya,
  aiInsights,
}: PreMatchSummaryProps) => {
  const { toast } = useToast();
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const element = document.getElementById('pre-match-summary');
      if (!element) return;

      const canvas = await html2canvas(element);
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>דוח טרום משחק</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${canvas.toDataURL()}" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Error printing:', error);
      toast({
        title: "שגיאה בהדפסה",
        description: "לא הצלחנו להדפיס את הדוח",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleEmailSend = async () => {
    try {
      setIsEmailSending(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("משתמש לא מחובר");

      const { data: profile } = await supabase
        .from('profiles')
        .select('coach_email')
        .eq('id', user.id)
        .single();

      if (!profile?.coach_email) {
        toast({
          title: "שגיאה",
          description: "לא נמצאה כתובת מייל של המאמן בפרופיל",
          variant: "destructive",
        });
        return;
      }

      const htmlContent = `
        <div dir="rtl">
          <h1>דוח טרום משחק - ${matchDetails.date}</h1>
          ${matchDetails.opponent ? `<h2>נגד: ${matchDetails.opponent}</h2>` : ''}
          
          <h3>הוויות נבחרות:</h3>
          <ul>
            ${havaya.map(h => `<li>${h}</li>`).join('')}
          </ul>
          
          <h3>פעולות למעקב:</h3>
          <ul>
            ${actions.map(action => `
              <li>
                ${action.name}
                ${action.goal ? `<br>יעד: ${action.goal}` : ''}
              </li>
            `).join('')}
          </ul>
          
          <h3>תשובות לשאלות:</h3>
          ${Object.entries(answers).map(([question, answer]) => `
            <div style="margin-bottom: 1rem;">
              <strong>${question}</strong>
              <p>${answer}</p>
            </div>
          `).join('')}
        </div>
      `;

      const { error } = await supabase.functions.invoke('send-pre-match-report', {
        body: {
          to: [profile.coach_email],
          subject: `דוח טרום משחק - ${matchDetails.date}`,
          html: htmlContent,
        },
      });

      if (error) throw error;

      toast({
        title: "נשלח בהצלחה",
        description: "דוח טרום משחק נשלח למייל המאמן",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה בשליחת המייל",
        description: "לא הצלחנו לשלוח את המייל",
        variant: "destructive",
      });
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div id="pre-match-summary">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-right">סיכום דוח טרום משחק</h2>
          <p className="text-muted-foreground text-right">
            תאריך: {matchDetails.date}
            {matchDetails.opponent && ` | נגד: ${matchDetails.opponent}`}
          </p>
        </div>

        {havaya.length > 0 && (
          <div className="border p-4 rounded-lg mt-4">
            <h3 className="text-lg font-semibold mb-2 text-right">הוויות נבחרות</h3>
            <div className="flex flex-wrap gap-2 justify-end">
              {havaya.map((h, index) => (
                <Badge key={index} variant="secondary">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-right">פעולות למעקב</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action, index) => (
              <div key={index} className="border p-3 rounded-lg text-right">
                <h4 className="font-semibold">{action.name}</h4>
                {action.goal && (
                  <p className="text-sm text-gray-600 mt-1">יעד: {action.goal}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-right">תשובות לשאלות</h3>
          <div className="space-y-4">
            {Object.entries(answers).map(([question, answer], index) => (
              <div key={index} className="border p-3 rounded-lg text-right">
                <p className="font-medium">{question}</p>
                <p className="text-muted-foreground">{answer}</p>
              </div>
            ))}
          </div>
        </div>

        {aiInsights.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-right">תובנות AI</h3>
            <ul className="space-y-2 text-right">
              {aiInsights.map((insight, index) => (
                <li key={index} className="text-muted-foreground">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <SummaryActions
        onEmailSend={handleEmailSend}
        onPrint={handlePrint}
        isEmailSending={isEmailSending}
        isPrinting={isPrinting}
      />
    </div>
  );
};