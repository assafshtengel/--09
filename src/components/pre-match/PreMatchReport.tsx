import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { NotificationBell } from "../notifications/NotificationBell";
import { PerformanceStats } from "../stats/PerformanceStats";
import { PreMatchDashboard } from "./PreMatchDashboard";
import { MatchDetailsStep } from "./steps/MatchDetailsStep";
import { ActionsStep } from "./steps/ActionsStep";
import { QuestionsStep } from "./steps/QuestionsStep";
import { SummaryStep } from "./steps/SummaryStep";
import { Action } from "@/components/ActionSelector";
import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence } from "framer-motion";

type Step = "dashboard" | "details" | "actions" | "questions" | "summary";

export const PreMatchReport = () => {
  const [currentStep, setCurrentStep] = useState<Step>("dashboard");
  const [matchDetails, setMatchDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    position: "forward",
    opponent: "",
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

  const handleMatchDetailsSubmit = (details: any) => {
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
    switch (currentStep) {
      case "dashboard":
        return (
          <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
            <div className="flex justify-between items-center mb-6">
              <NotificationBell />
              <h1 className="text-2xl font-bold">דוח טרום משחק</h1>
            </div>
            <PreMatchDashboard onCreateNew={() => setCurrentStep("details")} />
            <PerformanceStats />
          </div>
        );
      case "details":
        return (
          <MatchDetailsStep
            matchDetails={matchDetails}
            onSubmit={handleMatchDetailsSubmit}
          />
        );
      case "actions":
        return (
          <ActionsStep
            position={matchDetails.position}
            havaya={havaya}
            selectedActions={selectedActions}
            onHavayaChange={setHavaya}
            onActionsSubmit={handleActionsSubmit}
          />
        );
      case "questions":
        return (
          <QuestionsStep onSubmit={handleQuestionsSubmit} />
        );
      case "summary":
        return (
          <SummaryStep
            matchDetails={matchDetails}
            actions={selectedActions}
            answers={questionsAnswers}
            havaya={havaya}
            aiInsights={[]}
            onFinish={handleFinalSubmit}
          />
        );
      default:
        return null;
    }
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
                  onClick={() => setCurrentStep(steps[currentStepIndex - 1].id as Step)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                  חזור
                </button>
              )}
              
              {currentStep !== "summary" && currentStepIndex < steps.length - 1 && (
                <button
                  onClick={() => setCurrentStep(steps[currentStepIndex + 1].id as Step)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mr-auto"
                >
                  המשך
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};