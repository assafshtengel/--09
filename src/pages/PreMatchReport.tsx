import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MatchDetailsForm } from "@/components/pre-match/MatchDetailsForm";
import { PreMatchCombinedForm } from "@/components/pre-match/PreMatchCombinedForm";
import { PreMatchSummaryView } from "@/components/pre-match/PreMatchSummaryView";
import { usePreMatchReport } from "@/components/pre-match/hooks/usePreMatchReport";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PreMatchReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentStep,
    matchDetails,
    selectedActions,
    questionsAnswers,
    havaya,
    handleMatchDetailsSubmit,
    handleCombinedFormSubmit,
    handleFinish,
    matchId,
    reportId,
    setSelectedActions,
    setQuestionsAnswers,
    setHavaya
  } = usePreMatchReport();

  const savePreMatchReport = async (data: {
    havaya: string;
    actions: any[];
    answers: Record<string, string>;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      console.log('Saving pre-match report with data:', { matchId, data });

      // If we don't have a matchId, create a new match first
      if (!matchId) {
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .insert({
            player_id: user.id,
            match_date: matchDetails.date,
            opponent: matchDetails.opponent,
            player_position: matchDetails.position,
            status: 'preview'
          })
          .select()
          .single();

        if (matchError) throw matchError;
        console.log('Created new match:', match);
      }

      // Create or update the pre-match report
      const { data: report, error: reportError } = await supabase
        .from('pre_match_reports')
        .upsert({
          id: reportId || undefined,
          player_id: user.id,
          match_date: matchDetails.date,
          match_time: matchDetails.time,
          opponent: matchDetails.opponent,
          actions: data.actions,
          havaya: data.havaya,
          questions_answers: data.answers,
          status: 'completed'
        })
        .select()
        .single();

      if (reportError) throw reportError;
      console.log('Saved pre-match report:', report);

      // Update local state with the new data
      setHavaya(data.havaya);
      setSelectedActions(data.actions);
      setQuestionsAnswers(data.answers);

      // If we have a matchId, update it with the report id
      if (matchId) {
        const { error: updateError } = await supabase
          .from('matches')
          .update({ pre_match_report_id: report.id })
          .eq('id', matchId);

        if (updateError) throw updateError;
      }

      // Call the original handleCombinedFormSubmit to update local state
      handleCombinedFormSubmit(data);

      toast({
        title: "נשמר בהצלחה",
        description: "הדוח נשמר בהצלחה",
      });

    } catch (error) {
      console.error('Error saving pre-match report:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הדוח",
        variant: "destructive",
      });
    }
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
            onSubmit={savePreMatchReport}
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