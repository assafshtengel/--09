import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Mail, Printer, Camera, Home } from "lucide-react";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { Action } from "@/components/ActionSelector";
import { convertJsonArrayToActions } from "@/utils/typeConverters";
import { PreMatchContent } from "./summary/PreMatchContent";

export const PreMatchSummary = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [matchDetails, setMatchDetails] = useState<{
    date: string;
    time?: string;
    opponent?: string;
  }>({ date: '' });
  const [actions, setActions] = useState<Action[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [havaya, setHavaya] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      if (!reportId) return;

      try {
        const { data: report, error } = await supabase
          .from('pre_match_reports')
          .select('*')
          .eq('id', reportId)
          .single();

        if (error) throw error;

        if (report) {
          setMatchDetails({
            date: report.match_date,
            time: report.match_time,
            opponent: report.opponent
          });
          setActions(convertJsonArrayToActions(report.actions));
          setHavaya(report.havaya || '');
          setAnswers(report.questions_answers as Record<string, string>);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת נתוני הדוח",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [reportId, toast]);

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
          subject: `דוח טרום משחק - ${format(new Date(matchDetails.date), 'dd/MM/yyyy')}`,
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div id="pre-match-summary" className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-right">דוח טרום משחק</h2>
          <p className="text-muted-foreground text-right">
            {format(new Date(matchDetails.date), 'dd/MM/yyyy')}
            {matchDetails.opponent && ` | נגד: ${matchDetails.opponent}`}
          </p>
        </div>

        <PreMatchContent
          havaya={havaya}
          actions={actions}
          answers={answers}
        />
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