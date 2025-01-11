import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { Mail, Printer, Instagram, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { InstagramPreMatchSummary } from "./InstagramPreMatchSummary";
import { PreMatchPreparationDialog } from "./PreMatchPreparationDialog";

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
  const [showInstagramSummary, setShowInstagramSummary] = useState(false);
  const [showPreparationDialog, setShowPreparationDialog] = useState(false);
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

      const htmlContent = `
        <div dir="rtl">
          <h2>דוח טרום משחק - ${playerName}</h2>
          <div>
            <h3>פרטי המשחק</h3>
            <p>תאריך: ${format(new Date(matchDetails.date), 'dd/MM/yyyy')}</p>
            ${matchDetails.opponent ? `<p>נגד: ${matchDetails.opponent}</p>` : ''}
          </div>
          
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

  const createMatchRecord = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: match, error } = await supabase
        .from('matches')
        .insert([
          {
            player_id: user.id,
            match_date: matchDetails.date,
            opponent: matchDetails.opponent,
            status: 'preview'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (match) setReportId(match.id);
    } catch (error) {
      console.error('Error creating match record:', error);
    }
  };

  useEffect(() => {
    if (!reportId) {
      createMatchRecord();
    }
  }, []);

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
          onClick={() => setShowPreparationDialog(true)}
          variant="outline"
          className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100"
        >
          <FileText className="h-4 w-4" />
          ההכנה שלי למשחק
        </Button>
        <Button onClick={shareToInstagram} variant="outline" className="flex items-center gap-2">
          <Instagram className="h-4 w-4" />
          שתף באינסטגרם
        </Button>
        <Button onClick={onFinish}>סיים</Button>
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
          matchId={reportId}
        />
      )}

      {showPreparationDialog && (
        <PreMatchPreparationDialog
          isOpen={showPreparationDialog}
          onClose={() => setShowPreparationDialog(false)}
          matchId={reportId}
        />
      )}
    </div>
  );
};
