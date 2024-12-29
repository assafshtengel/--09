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

interface MatchDetails {
  date: string;
  time?: string;
  opponent?: string;
  location?: string;
  position?: string;
}

export const PreMatchReport = () => {
  const [currentStep, setCurrentStep] = useState<
    "dashboard" | "details" | "actions" | "questions" | "summary"
  >("dashboard");
  const [matchDetails, setMatchDetails] = useState<MatchDetails>({
    date: new Date().toISOString().split("T")[0],
    position: "forward",
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState<Record<string, string>>(
    {}
  );
  const [havaya, setHavaya] = useState("");
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
          <HavayaSelector value={havaya} onChange={setHavaya} />
          <div className="mt-6">
            <ActionSelector
              position={matchDetails.position || "forward"}
              onSubmit={handleActionsSubmit}
            />
          </div>
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
          havaya={havaya}
          aiInsights={[]}
          onFinish={handleFinalSubmit}
        />
      )}
    </div>
  );
};