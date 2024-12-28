import { useState } from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Action } from "@/components/ActionSelector";

interface PreMatchSummaryProps {
  matchDetails: {
    date: string;
    time: string;
    opponent: string;
  };
  actions: Action[];
  answers: Record<string, string>;
  aiInsights: string[];
  onFinish: () => void;
}

export const PreMatchSummary = ({
  matchDetails,
  actions,
  answers,
  aiInsights,
  onFinish
}: PreMatchSummaryProps) => {
  const [isSending, setIsSending] = useState(false);

  const takeScreenshot = async () => {
    try {
      const element = document.getElementById('pre-match-summary');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `pre-match-report-${matchDetails.date}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success("צילום מסך נשמר בהצלחה");
      }
    } catch (error) {
      toast.error("שגיאה בשמירת צילום המסך");
    }
  };

  const sendEmail = async () => {
    try {
      setIsSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const htmlContent = `
        <div dir="rtl">
          <h1>דוח טרום משחק</h1>
          <h2>פרטי המשחק</h2>
          <p>תאריך: ${matchDetails.date}</p>
          <p>שעה: ${matchDetails.time || 'לא צוין'}</p>
          <p>יריב: ${matchDetails.opponent}</p>

          <h2>יעדים</h2>
          <ul>
            ${actions.map(action => `
              <li>${action.name}${action.goal ? ` - ${action.goal}` : ''}</li>
            `).join('')}
          </ul>

          <h2>שאלות ותשובות</h2>
          ${Object.entries(answers).map(([q, a]) => `
            <div>
              <p><strong>${q}</strong></p>
              <p>${a}</p>
            </div>
          `).join('')}

          <h2>תובנות AI</h2>
          <ul>
            ${aiInsights.map(insight => `<li>${insight}</li>`).join('')}
          </ul>
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
      toast.success("הדוח נשלח בהצלחה למייל");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("שגיאה בשליחת המייל");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div id="pre-match-summary" className="space-y-6 p-6 border rounded-lg">
        <div className="text-right">
          <h2 className="text-2xl font-bold mb-4">סיכום דוח טרום משחק</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">פרטי המשחק</h3>
            <p>תאריך: {matchDetails.date}</p>
            {matchDetails.time && <p>שעה: {matchDetails.time}</p>}
            <p>יריב: {matchDetails.opponent}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">יעדים למשחק</h3>
            <ul className="space-y-2">
              {actions.map((action, index) => (
                <li key={index} className="border p-2 rounded">
                  {action.name}
                  {action.goal && <div className="text-sm text-gray-600">יעד: {action.goal}</div>}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">שאלות ותשובות</h3>
            <div className="space-y-4">
              {Object.entries(answers).map(([question, answer], index) => (
                <div key={index} className="border p-3 rounded">
                  <p className="font-medium mb-1">{question}</p>
                  <p className="text-gray-600">{answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">תובנות AI</h3>
            <ul className="space-y-2">
              {aiInsights.map((insight, index) => (
                <li key={index} className="text-gray-600">{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button onClick={takeScreenshot} variant="outline">
          צלם מסך
        </Button>
        <Button 
          onClick={sendEmail} 
          variant="outline"
          disabled={isSending}
        >
          {isSending ? "שולח..." : "שלח למייל"}
        </Button>
        <Button onClick={onFinish}>
          סיים וחזור לדף הבית
        </Button>
      </div>
    </div>
  );
};