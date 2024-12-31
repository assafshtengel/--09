import { useState } from "react";
import { MatchDetailsForm } from "./MatchDetailsForm";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { HavayaSelector } from "./HavayaSelector";
import { PreMatchSummary } from "./PreMatchSummary";
import { ActionSelector } from "@/components/ActionSelector";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MatchDetails {
  date: string;
  time?: string;
  opponent?: string;
  position?: string;
}

export const PreMatchReport = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [matchDetails, setMatchDetails] = useState<MatchDetails>({
    date: "",
    time: "",
    opponent: "",
  });
  const [actions, setActions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [havaya, setHavaya] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [preMatchReportId, setPreMatchReportId] = useState<string | null>(null);

  const handleNext = async () => {
    if (step === 4) {
      // Save pre-match report after havaya selection
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const preMatchReportData = {
          player_id: user.id,
          match_date: matchDetails.date,
          match_time: matchDetails.time,
          opponent: matchDetails.opponent,
          actions: actions,
          questions_answers: answers,
          havaya: havaya.join(','),
          status: 'draft'
        };

        let reportId = preMatchReportId;

        if (!reportId) {
          const { data: report, error: reportError } = await supabase
            .from('pre_match_reports')
            .insert(preMatchReportData)
            .select()
            .single();

          if (reportError) throw reportError;
          reportId = report.id;
          setPreMatchReportId(reportId);
        } else {
          const { error: updateError } = await supabase
            .from('pre_match_reports')
            .update(preMatchReportData)
            .eq('id', reportId);

          if (updateError) throw updateError;
        }

        // Create match record
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            player_id: user.id,
            match_date: matchDetails.date,
            opponent: matchDetails.opponent,
            pre_match_report_id: reportId,
            status: 'preview'
          });

        if (matchError) throw matchError;

        toast({
          title: "נשמר בהצלחה",
          description: "דוח טרום משחק נשמר במערכת",
        });
      } catch (error) {
        console.error('Error saving pre-match report:', error);
        toast({
          title: "שגיאה בשמירת הדוח",
          description: "אנא נסה שוב",
          variant: "destructive",
        });
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="match-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <MatchDetailsForm
                onSubmit={(values) => {
                  setMatchDetails(values);
                  handleNext();
                }}
                initialData={matchDetails}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-right">בחר פעולות למעקב</h2>
              <ActionSelector
                position={matchDetails.position || "forward"}
                onSubmit={(selectedActions) => {
                  setActions(selectedActions);
                  handleNext();
                }}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PreMatchQuestionnaire
                onSubmit={(values) => {
                  setAnswers(values);
                  handleNext();
                }}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="havaya"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HavayaSelector
                value={havaya}
                onChange={setHavaya}
              />
              <div className="flex justify-between mt-6">
                <Button 
                  onClick={handleNext}
                  disabled={havaya.length < 3}
                >
                  המשך
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleBack}>
                  חזור
                </Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PreMatchSummary
                matchDetails={matchDetails}
                actions={actions}
                answers={answers}
                havaya={havaya}
                aiInsights={aiInsights}
                onFinish={() => setStep(1)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};