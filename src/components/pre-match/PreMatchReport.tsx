import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MatchDetailsStep } from "./steps/MatchDetailsStep";
import { ActionsStep } from "./steps/ActionsStep";
import { QuestionsStep } from "./steps/QuestionsStep";
import { SummaryStep } from "./steps/SummaryStep";
import { Action } from "@/components/ActionSelector";
import { useToast } from "@/hooks/use-toast";

export const PreMatchReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matchDetails, setMatchDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    position: "forward",
    opponent: "",
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState({});
  const [havaya, setHavaya] = useState("");

  const handleMatchDetailsSubmit = (details: any) => {
    setMatchDetails(details);
    navigate(`/match/${matchDetails.date}/experience`);
  };

  const handleActionsSubmit = (actions: Action[]) => {
    setSelectedActions(actions);
    navigate(`/match/${matchDetails.date}/questions`);
  };

  const handleQuestionsSubmit = (answers: Record<string, string>) => {
    setQuestionsAnswers(answers);
    navigate(`/match/${matchDetails.date}/summary`);
  };

  const handleFinalSubmit = async () => {
    toast({
      title: "הדוח נשלח בהצלחה",
      description: "תודה על השיתוף!",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
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
        {renderStep()}
      </div>
    </div>
  );
};
