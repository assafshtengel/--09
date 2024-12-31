import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Action } from "@/components/ActionSelector";
import { PreMatchActions } from "./components/PreMatchActions";
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
  onFinish,
}: PreMatchSummaryProps) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEmailSending, setIsEmailSending] = useState(false);

  const handleWhatsAppShare = async () => {
    try {
      setIsSending(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("משתמש לא מחובר");

      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', user.id)
        .single();

      if (!profile?.phone_number) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מספר טלפון בפרופיל",
          variant: "destructive",
        });
        return;
      }

      const summaryText = `דוח טרום משחק - ${matchDetails.date}${matchDetails.opponent ? ` מול ${matchDetails.opponent}` : ''}\n\n` +
        `הוויות נבחרות:\n${havaya.join('\n')}\n\n` +
        `יעדים למשחק:\n${actions.map(action => 
          `- ${action.name}${action.goal ? ` (יעד: ${action.goal})` : ''}`
        ).join('\n')}\n\n` +
        `תשובות לשאלות:\n${Object.entries(answers)
          .map(([question, answer]) => `${question}: ${answer}`).join('\n')}`;

      const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          message: summaryText,
          recipientNumber: profile.phone_number
        }
      });

      if (whatsappError) throw whatsappError;

      toast({
        title: "נשלח בהצלחה",
        description: "דוח טרום משחק נשלח לוואטסאפ שלך",
      });

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: "לא הצלחנו לשלוח את ההודעה",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const element = document.getElementById('pre-match-summary');
      if (!element) return;

      const canvas = await html2canvas(element);
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>דוח טרום משחק</title>
          </head>
          <body style="margin: 0; display: flex; justify-content: center;">
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
      if (!user?.email) throw new Error("לא נמצאה כתובת מייל");

      const htmlContent = `
        <div dir="rtl">
          <h1>דוח טרום משחק - ${matchDetails.date}</h1>
          ${matchDetails.opponent ? `<h2>נגד: ${matchDetails.opponent}</h2>` : ''}
          
          <h3>הוויות נבחרות:</h3>
          <ul>
            ${havaya.map(h => `<li>${h}</li>`).join('')}
          </ul>
          
          <h3>יעדים למשחק:</h3>
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
          to: [user.email],
          subject: `דוח טרום משחק - ${matchDetails.date}`,
          html: htmlContent,
        },
      });

      if (error) throw error;

      toast({
        title: "נשלח בהצלחה",
        description: "דוח טרום משחק נשלח למייל שלך",
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
          <h2 className="text-2xl font-bold">סיכום דוח טרום משחק</h2>
          <p className="text-muted-foreground">
            תאריך: {matchDetails.date}
            {matchDetails.opponent && ` | נגד: ${matchDetails.opponent}`}
          </p>
        </div>

        {havaya.length > 0 && (
          <div className="border p-4 rounded-lg mt-4">
            <h3 className="text-lg font-semibold mb-2">הוויות נבחרות</h3>
            <div className="flex flex-wrap gap-2">
              {havaya.map((h, index) => (
                <Badge key={index} variant="secondary" className="text-base">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
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

        <div className="mt-4">
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
          <div className="mt-4">
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

      <PreMatchActions
        onEmailSend={handleEmailSend}
        onPrint={handlePrint}
        onWhatsAppShare={handleWhatsAppShare}
        isEmailSending={isEmailSending}
        isPrinting={isPrinting}
        isWhatsAppSending={isSending}
      />
    </div>
  );
};
