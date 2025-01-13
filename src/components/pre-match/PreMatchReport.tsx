import { useState } from "react";
import { ActionSelector, Action } from "@/components/ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { MatchDetailsForm } from "./MatchDetailsForm";
import { PreMatchSummary } from "./PreMatchSummary";
import { PreMatchDashboard } from "./PreMatchDashboard";
import { SocialShareGoals } from "./SocialShareGoals";
import { HavayaSelector } from "./HavayaSelector";
import { ObserverLinkDialog } from "./ObserverLinkDialog";
import { PreGamePlannerDialog } from "./PreGamePlannerDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const PreMatchReport = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<
    "dashboard" | "details" | "actions" | "questions" | "summary"
  >("dashboard");
  const [matchDetails, setMatchDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    position: "forward",
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState({});
  const [havaya, setHavaya] = useState<string[]>([]);
  const [reportId, setReportId] = useState<string | null>(null);
  const [showObserverLink, setShowObserverLink] = useState(false);
  const [observerToken, setObserverToken] = useState<string | null>(null);
  const [showPlannerDialog, setShowPlannerDialog] = useState(false);

  const steps = [
    { id: "dashboard", label: "התחלה" },
    { id: "details", label: "פרטי משחק" },
    { id: "actions", label: "יעדים" },
    { id: "questions", label: "שאלון" },
    { id: "summary", label: "סיכום" },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleMatchDetailsSubmit = async (details) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: report, error } = await supabase
        .from("pre_match_reports")
        .insert({
          player_id: user.id,
          match_date: details.date,
          match_time: details.time,
          opponent: details.opponent,
          status: "draft",
          actions: [],
          questions_answers: []
        })
        .select()
        .single();

      if (error) throw error;
      
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          player_id: user.id,
          match_date: details.date,
          opponent: details.opponent,
          pre_match_report_id: report.id,
          status: 'preview'
        })
        .select('observer_token')
        .single();

      if (matchError) throw matchError;
      
      setReportId(report.id);
      setMatchDetails(details);
      setObserverToken(match.observer_token);
      setCurrentStep("actions");
      
      toast.success("פרטי המשחק נשמרו");
    } catch (error) {
      console.error("Error saving match details:", error);
      toast.error("שגיאה בשמירת פרטי המשחק");
    }
  };

  const handleActionsSubmit = async (actions: Action[]) => {
    if (!reportId) return;

    try {
      const jsonActions = actions.map(action => ({
        id: action.id,
        name: action.name,
        goal: action.goal || null,
        isSelected: action.isSelected
      }));

      const { error } = await supabase
        .from("pre_match_reports")
        .update({
          actions: jsonActions,
          havaya: havaya.join(',')
        })
        .eq("id", reportId);

      if (error) throw error;

      setSelectedActions(actions);
      setCurrentStep("questions");
      toast.success("היעדים נשמרו");
    } catch (error) {
      console.error("Error saving actions:", error);
      toast.error("שגיאה בשמירת היעדים");
    }
  };

  const handleQuestionsSubmit = async (answers: Record<string, string>) => {
    if (!reportId) return;

    try {
      const { error } = await supabase
        .from("pre_match_reports")
        .update({
          questions_answers: answers,
          status: "completed"
        })
        .eq("id", reportId);

      if (error) throw error;

      setQuestionsAnswers(answers);
      setCurrentStep("summary");
      toast.success("תשובותיך נשמרו");
    } catch (error) {
      console.error("Error saving answers:", error);
      toast.error("שגיאה בשמירת התשובות");
    }
  };

  const handleFinalSubmit = async () => {
    if (!reportId) return;

    try {
      const { error } = await supabase
        .from("pre_match_reports")
        .update({ status: "completed" })
        .eq("id", reportId);

      if (error) throw error;

      toast.success("הדוח נשמר בהצלחה");
      setShowPlannerDialog(true);
    } catch (error) {
      console.error("Error completing report:", error);
      toast.error("שגיאה בשמירת הדוח");
    }
  };

  const handlePlannerConfirm = () => {
    setShowPlannerDialog(false);
    navigate("/pre-game-planner");
  };

  const handlePlannerCancel = () => {
    setShowPlannerDialog(false);
    navigate("/dashboard");
  };

  const renderStep = () => {
    const commonProps = {
      className: "w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6",
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 }
    };

    return (
      <AnimatePresence mode="wait">
        {currentStep === "dashboard" && (
          <motion.div {...commonProps} key="dashboard">
            <PreMatchDashboard onCreateNew={() => setCurrentStep("details")} />
          </motion.div>
        )}

        {currentStep === "details" && (
          <motion.div {...commonProps} key="details">
            <MatchDetailsForm
              onSubmit={handleMatchDetailsSubmit}
              initialData={matchDetails}
            />
          </motion.div>
        )}

        {currentStep === "actions" && (
          <motion.div {...commonProps} key="actions">
            <div className="space-y-8">
              {observerToken && (
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowObserverLink(true)}
                    className="flex items-center gap-2 hover:bg-gray-100"
                  >
                    <Link className="h-4 w-4" />
                    קישור למשקיף
                  </Button>
                </div>
              )}
              <HavayaSelector value={havaya} onChange={setHavaya} />
              <ActionSelector
                position={matchDetails.position || "forward"}
                onSubmit={handleActionsSubmit}
              />
              <SocialShareGoals goals={selectedActions} />
            </div>
          </motion.div>
        )}

        {currentStep === "questions" && (
          <motion.div {...commonProps} key="questions">
            <PreMatchQuestionnaire onSubmit={handleQuestionsSubmit} />
          </motion.div>
        )}

        {currentStep === "summary" && (
          <motion.div {...commonProps} key="summary">
            <PreMatchSummary
              matchDetails={matchDetails}
              actions={selectedActions}
              answers={questionsAnswers}
              havaya={havaya}
              aiInsights={[]}
              onFinish={handleFinalSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {currentStep !== "dashboard" && (
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-right">
                {steps.find(step => step.id === currentStep)?.label}
              </h1>
              <div className="text-sm text-gray-500">
                שלב {currentStepIndex + 1} מתוך {steps.length}
              </div>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="flex justify-between mt-4">
              {currentStepIndex > 0 && (
                <button
                  onClick={() => setCurrentStep(steps[currentStepIndex - 1].id as any)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                  חזור
                </button>
              )}
              
              {currentStep !== "summary" && currentStepIndex < steps.length - 1 && (
                <button
                  onClick={() => setCurrentStep(steps[currentStepIndex + 1].id as any)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mr-auto"
                >
                  המשך
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {renderStep()}

        <ObserverLinkDialog
          open={showObserverLink}
          onOpenChange={setShowObserverLink}
          observerToken={observerToken}
        />

        <PreGamePlannerDialog
          open={showPlannerDialog}
          onOpenChange={setShowPlannerDialog}
          onConfirm={handlePlannerConfirm}
          onCancel={handlePlannerCancel}
        />
      </div>
    </div>
  );
};