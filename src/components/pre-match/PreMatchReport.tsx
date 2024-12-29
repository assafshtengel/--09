import { useState } from "react";
import { ActionSelector, Action } from "@/components/ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { MatchDetailsForm } from "./MatchDetailsForm";
import { PreMatchSummary } from "./PreMatchSummary";
import { PreMatchDashboard } from "./PreMatchDashboard";
import { SocialShareGoals } from "./SocialShareGoals";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PreMatchReport = () => {
  const [currentStep, setCurrentStep] = useState<"dashboard" | "details" | "actions" | "questions" | "summary">("dashboard");
  const [matchDetails, setMatchDetails] = useState<any>({});
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleMatchDetailsSubmit = (details: any) => {
    setMatchDetails(details);
    setCurrentStep("actions");
  };

  const handleActionsSubmit = (actions: Action[]) => {
    setSelectedActions(actions);
    setCurrentStep("questions");
  };

  const handleQuestionsSubmit = (answers: Record<string, string>) => {
    setQuestionsAnswers(answers);
    setCurrentStep("summary");
  };

  const handleFinalSubmit = async () => {
    // Logic to handle final submission
    toast({
      title: "הדוח נשלח בהצלחה",
      description: "תודה על השיתוף!",
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {currentStep === "dashboard" && (
        <PreMatchDashboard onCreateNew={() => setCurrentStep("details")} />
      )}

      {currentStep === "details" && (
        <MatchDetailsForm onSubmit={handleMatchDetailsSubmit} />
      )}

      {currentStep === "actions" && (
        <>
          <ActionSelector
            position={matchDetails.position || "forward"}
            onSubmit={handleActionsSubmit}
          />
          <SocialShareGoals goals={selectedActions} />
        </>
      )}

      {currentStep === "questions" && (
        <PreMatchQuestionnaire onSubmit={handleQuestionsSubmit} />
      )}

      {currentStep === "summary" && (
        <PreMatchSummary
          matchDetails={matchDetails}
          selectedActions={selectedActions}
          questionsAnswers={questionsAnswers}
          onSubmit={handleFinalSubmit}
          onBack={() => setCurrentStep("questions")}
        />
      )}
    </div>
  );
};
