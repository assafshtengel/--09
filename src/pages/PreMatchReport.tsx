import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MatchDetailsStep } from "@/components/pre-match/steps/MatchDetailsStep";
import { ActionsStep } from "@/components/pre-match/steps/ActionsStep";
import { QuestionsStep } from "@/components/pre-match/steps/QuestionsStep";
import { SummaryStep } from "@/components/pre-match/steps/SummaryStep";
import { Action } from "@/components/ActionSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Step = "details" | "actions" | "questions" | "summary";

export const PreMatchReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [matchDetails, setMatchDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    position: "forward",
    opponent: "",
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState<Record<string, string>>({});
  const [havaya, setHavaya] = useState("");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const handleMatchDetailsSubmit = async (details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Create a new match record
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          player_id: user.id,
          match_date: details.date,
          opponent: details.opponent,
          player_position: details.position,
          status: 'preview'
        })
        .select()
        .single();

      if (matchError) throw matchError;
      
      setMatchId(match.id);
      setMatchDetails(details);
      setCurrentStep("actions");
    } catch (error) {
      console.error('Error saving match details:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת פרטי המשחק",
        variant: "destructive",
      });
    }
  };

  const handleActionsSubmit = async (actions: Action[]) => {
    if (!matchId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      // Create or update pre-match report
      const reportData = {
        player_id: user.id,
        match_date: matchDetails.date,
        opponent: matchDetails.opponent,
        actions: JSON.stringify(actions),
        havaya,
        status: 'draft',
      };

      let report;
      if (reportId) {
        const { data, error } = await supabase
          .from('pre_match_reports')
          .update(reportData)
          .eq('id', reportId)
          .select()
          .single();
          
        if (error) throw error;
        report = data;
      } else {
        const { data, error } = await supabase
          .from('pre_match_reports')
          .insert(reportData)
          .select()
          .single();

        if (error) throw error;
        report = data;
        setReportId(report.id);

        // Update match with report id
        const { error: updateError } = await supabase
          .from('matches')
          .update({ pre_match_report_id: report.id })
          .eq('id', matchId);

        if (updateError) throw updateError;
      }

      setSelectedActions(actions);
      setCurrentStep("questions");
    } catch (error) {
      console.error('Error saving actions:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הפעולות",
        variant: "destructive",
      });
    }
  };

  const handleQuestionsSubmit = async (answers: Record<string, string>) => {
    if (!reportId) return;

    try {
      const { error } = await supabase
        .from('pre_match_reports')
        .update({
          questions_answers: answers,
          status: 'completed'
        })
        .eq('id', reportId);

      if (error) throw error;

      setQuestionsAnswers(answers);
      setCurrentStep("summary");
    } catch (error) {
      console.error('Error saving answers:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת התשובות",
        variant: "destructive",
      });
    }
  };

  const handleFinalSubmit = async () => {
    if (matchId) {
      navigate(`/match/${matchId}`);
    } else {
      navigate('/dashboard');
    }
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