import { useState } from "react";
import { ActionSelector, Action } from "@/components/ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { MatchDetailsForm } from "./MatchDetailsForm";
import { PreMatchSummary } from "./PreMatchSummary";
import { PreMatchDashboard } from "./PreMatchDashboard";
import { SocialShareGoals } from "./SocialShareGoals";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MatchDetails {
  date: string;
  time?: string;
  opponent?: string;
  location?: string;
  position?: string;
}

export const PreMatchReport = () => {
  const [currentStep, setCurrentStep] = useState<"dashboard" | "details" | "actions" | "questions" | "summary">("dashboard");
  const [matchDetails, setMatchDetails] = useState<MatchDetails>({ 
    date: new Date().toISOString().split('T')[0],
    position: "forward" // Set a default position
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleMatchDetailsSubmit = (details: MatchDetails) => {
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
        <MatchDetailsForm 
          onSubmit={handleMatchDetailsSubmit}
          initialData={matchDetails}
        />
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
          actions={selectedActions}
          answers={questionsAnswers}
          aiInsights={[]}
          onFinish={handleFinalSubmit}
        />
      )}
    </div>
  );
};