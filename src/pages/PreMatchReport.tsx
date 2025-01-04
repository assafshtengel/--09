import { MatchDetailsForm } from "@/components/pre-match/MatchDetailsForm";
import { PreMatchCombinedForm } from "@/components/pre-match/PreMatchCombinedForm";
import { PreMatchSummaryView } from "@/components/pre-match/PreMatchSummaryView";
import { usePreMatchReport } from "@/components/pre-match/hooks/usePreMatchReport";

export const PreMatchReport = () => {
  const {
    currentStep,
    matchDetails,
    selectedActions,
    questionsAnswers,
    havaya,
    handleMatchDetailsSubmit,
    handleCombinedFormSubmit,
    handleFinish
  } = usePreMatchReport();

  const renderStep = () => {
    switch (currentStep) {
      case "details":
        return (
          <MatchDetailsForm
            initialData={matchDetails}
            onSubmit={handleMatchDetailsSubmit}
          />
        );
      case "form":
        return (
          <PreMatchCombinedForm
            position={matchDetails.position}
            onSubmit={handleCombinedFormSubmit}
          />
        );
      case "summary":
        return (
          <PreMatchSummaryView
            matchDate={matchDetails.date}
            opponent={matchDetails.opponent}
            position={matchDetails.position}
            havaya={havaya}
            actions={selectedActions}
            answers={questionsAnswers}
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