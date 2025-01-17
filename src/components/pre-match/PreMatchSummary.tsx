import { Button } from "@/components/ui/button";
import { Mail, Printer, ExternalLink, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { InstagramPreMatchSummary } from "./InstagramPreMatchSummary";
import { PreMatchCaptionPopup } from "./PreMatchCaptionPopup";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SummaryWorkflow } from "./summary/SummaryWorkflow";

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
  onFinish: () => Promise<void>;
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
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const processedHavaya = havaya
    .map(h => h.trim())
    .filter(h => h.length > 0);

  // Auto-save report when component mounts
  useEffect(() => {
    const saveReport = async () => {
      try {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");

        const { data: report, error } = await supabase
          .from("pre_match_reports")
          .insert({
            player_id: user.id,
            match_date: matchDetails.date,
            match_time: matchDetails.time,
            opponent: matchDetails.opponent,
            actions: actions,
            questions_answers: answers,
            havaya: processedHavaya.join(", "),
            status: "completed"
          })
          .select()
          .single();

        if (error) throw error;
        
        setReportId(report.id);
        toast({
          title: "הדוח נשמר בהצלחה",
          description: "תוכל למצוא אותו בעמוד דוחות טרום משחק",
        });
      } catch (error) {
        console.error('Error saving report:', error);
        toast({
          title: "שגיאה בשמירת הדוח",
          description: "אנא נסה שנית",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    };

    saveReport();
  }, []);

  const handleViewReports = () => {
    navigate('/pre-match-reports-list');
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

  return (
    <div className="space-y-6">
      <div id="pre-match-summary">
        <div className="border-b pb-4">
          <div className="flex justify-between items-center">
            <Button
              onClick={handleViewReports}
              variant="outline"
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              צפה בכל הדוחות
            </Button>
            <h2 className="text-2xl font-bold">סיכום דוח טרום משחק</h2>
          </div>
          <p className="text-muted-foreground">
            תאריך: {matchDetails.date}
            {matchDetails.opponent && ` | נגד: ${matchDetails.opponent}`}
            {matchDetails.match_type && ` | סוג משחק: ${matchDetails.match_type}`}
          </p>
        </div>

        {processedHavaya.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 mt-6"
          >
            <h3 className="text-lg font-semibold mb-4 text-right">הוויות נבחרות</h3>
            <div className="grid grid-cols-2 gap-4">
              {processedHavaya.map((h, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-center"
                >
                  <div className="w-full bg-white text-primary px-4 py-2.5 rounded-lg shadow-sm border border-primary/20 hover:shadow-md transition-all duration-200">
                    <span className="text-center block font-medium">{h}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-right">יעדים למשחק</h3>
          <div className="space-y-2">
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border rounded-lg p-2.5 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-end gap-4">
                  {action.goal && (
                    <span className="text-sm text-gray-600">יעד: {action.goal}</span>
                  )}
                  <span className="font-medium text-primary">{action.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-right">תשובות לשאלות</h3>
          <div className="space-y-4">
            {Object.entries(answers).map(([question, answer], index) => (
              <div key={index} className="border p-3 rounded-lg">
                <p className="font-medium text-right">{question}</p>
                <p className="text-muted-foreground text-right">{answer}</p>
              </div>
            ))}
          </div>
        </div>

        {aiInsights.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 text-right">תובנות AI</h3>
            <ul className="space-y-2">
              {aiInsights.map((insight, index) => (
                <li key={index} className="text-muted-foreground text-right">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <SummaryWorkflow reportId={reportId || ""} />

      <div className="flex flex-wrap gap-4 justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          הדפס
        </Button>
        <Button onClick={onFinish} disabled={isSaving}>סיים</Button>
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
