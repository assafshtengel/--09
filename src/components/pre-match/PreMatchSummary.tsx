import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { Mail, Printer, ExternalLink, Calendar, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { useState } from "react";
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

  const handleCreateSchedule = () => {
    navigate("/pre-game-planner", {
      state: {
        fromPreMatchReport: true,
        matchDate: matchDetails.date,
        matchTime: matchDetails.time
      }
    });
  };

  const formatQuestionsAndAnswers = () => {
    if (!answers || typeof answers !== 'object') return [];
    
    return Object.entries(answers).map(([key, value]) => {
      let question = key;
      if (key === 'stressLevel') {
        return {
          question: "מה רמת הלחץ שבה היית לפני המשחק?",
          answer: String(value)
        };
      }
      if (key === 'selfRating') {
        return {
          question: "איזה ציון אתה נותן לעצמך על המשחק?",
          answer: String(value)
        };
      }
      if (key === 'openEndedAnswers' && typeof value === 'object') {
        return Object.entries(value as Record<string, string>).map(([q, a]) => ({
          question: q,
          answer: String(a)
        }));
      }
      return { question, answer: String(value) };
    }).flat();
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
          <h3 className="text-lg font-semibold mb-4 text-right flex items-center gap-2 justify-end">
            <MessageSquare className="h-5 w-5" />
            תשובות לשאלות
          </h3>
          <div className="space-y-4">
            {formatQuestionsAndAnswers().map((qa, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100/50"
              >
                <p className="font-medium text-right mb-2 text-primary">{qa.question}</p>
                <p className="text-gray-700 text-right whitespace-pre-wrap">{qa.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      <SummaryWorkflow reportId={reportId || ""} />

      <div className="flex flex-wrap gap-4 justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          הדפס
        </Button>
        <Button 
          onClick={handleCreateSchedule}
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          צור סדר יום למשחק
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
