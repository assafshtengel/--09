import { useState } from "react";
import { ActionSelector, Action } from "@/components/ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { MatchDetailsForm } from "./MatchDetailsForm";
import { PreMatchSummary } from "./PreMatchSummary";
import { PreMatchDashboard } from "./PreMatchDashboard";
import { SocialShareGoals } from "./SocialShareGoals";
import { HavayaSelector } from "./HavayaSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Save } from "lucide-react";

export const PreMatchReport = () => {
  const [currentStep, setCurrentStep] = useState<
    "dashboard" | "details" | "actions" | "questions" | "summary"
  >("dashboard");
  const [matchDetails, setMatchDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    position: "forward",
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState({});
  const [havaya, setHavaya] = useState("");
  const { toast } = useToast();

  const steps = [
    { id: "dashboard", label: "התחלה" },
    { id: "details", label: "פרטי משחק" },
    { id: "actions", label: "יעדים" },
    { id: "questions", label: "שאלון" },
    { id: "summary", label: "סיכום" },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleMatchDetailsSubmit = (details) => {
    setMatchDetails(details);
    setCurrentStep("actions");
    toast({
      title: "פרטי המשחק נשמרו",
      description: "הבה נמשיך להגדרת היעדים",
    });
  };

  const handleActionsSubmit = (actions: Action[]) => {
    setSelectedActions(actions);
    setCurrentStep("questions");
    toast({
      title: "היעדים נשמרו",
      description: "הבה נמשיך לשאלון",
    });
  };

  const handleQuestionsSubmit = (answers: Record<string, string>) => {
    setQuestionsAnswers(answers);
    setCurrentStep("summary");
    toast({
      title: "תשובותיך נשמרו",
      description: "הבה נסכם את הדוח",
    });
  };

  const handleFinalSubmit = async () => {
    toast({
      title: "הדוח נשלח בהצלחה",
      description: "תודה על השיתוף!",
    });
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
      </div>
    </div>
  );
};