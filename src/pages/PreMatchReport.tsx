import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MatchDetailsForm } from "@/components/pre-match/MatchDetailsForm";
import { PreMatchCombinedForm } from "@/components/pre-match/PreMatchCombinedForm";
import { PreMatchSummaryView } from "@/components/pre-match/PreMatchSummaryView";
import { Action } from "@/components/ActionSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

type Step = "details" | "form" | "summary";

export const PreMatchReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [matchDetails, setMatchDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "",
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
      setCurrentStep("form");
    } catch (error) {
      console.error('Error saving match details:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת פרטי המשחק",
        variant: "destructive",
      });
    }
  };

  const handleCombinedFormSubmit = async (data: {
    havaya: string;
    actions: Json;
    answers: Record<string, string>;
  }) => {
    if (!matchId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const { data: report, error } = await supabase
        .from('pre_match_reports')
        .insert({
          player_id: user.id,
          match_date: matchDetails.date,
          match_time: matchDetails.time,
          opponent: matchDetails.opponent,
          actions: data.actions,
          havaya: data.havaya,
          questions_answers: data.answers as Json,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      // Update match with report id
      const { error: updateError } = await supabase
        .from('matches')
        .update({ pre_match_report_id: report.id })
        .eq('id', matchId);

      if (updateError) throw updateError;

      setReportId(report.id);
      setHavaya(data.havaya);
      
      if (Array.isArray(data.actions)) {
        const actions = data.actions.map(action => {
          if (typeof action === 'object' && action !== null) {
            return {
              id: String(action.id || ''),
              name: String(action.name || ''),
              isSelected: true,
              goal: action.goal ? String(action.goal) : undefined
            };
          }
          return null;
        }).filter((action): action is Action => action !== null);
        setSelectedActions(actions);
      }
      
      setQuestionsAnswers(data.answers);
      setCurrentStep("summary");
    } catch (error) {
      console.error('Error saving form data:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הנתונים",
        variant: "destructive",
      });
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

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
