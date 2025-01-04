import { useParams } from "react-router-dom";
import { PreMatchQuestionnaire } from "@/components/pre-match/PreMatchQuestionnaire";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { PreMatchSummaryView } from "@/components/pre-match/PreMatchSummaryView";
import type { Action } from "@/components/ActionSelector";

export const Questions = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  const handleSubmit = async (answers: Record<string, string>) => {
    if (!matchId) {
      toast({
        title: "שגיאה",
        description: "מזהה המשחק חסר",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get match details and existing pre-match report data
      const { data: match } = await supabase
        .from('matches')
        .select(`
          match_date,
          opponent,
          player_position,
          pre_match_report_id
        `)
        .eq('id', matchId)
        .single();

      if (!match) {
        throw new Error('Match not found');
      }

      // Get existing actions and havaya from pre-match report if it exists
      let existingActions: Action[] = [];
      let existingHavaya = '';
      
      if (match.pre_match_report_id) {
        const { data: existingReport } = await supabase
          .from('pre_match_reports')
          .select('actions, havaya')
          .eq('id', match.pre_match_report_id)
          .single();
          
        if (existingReport) {
          // Ensure actions is parsed as an array
          existingActions = Array.isArray(existingReport.actions) 
            ? existingReport.actions as Action[]
            : [];
          existingHavaya = existingReport.havaya || '';
        }
      }

      let reportId = match.pre_match_report_id;

      // If no pre-match report exists, create one
      if (!reportId) {
        const { data: newReport, error: createError } = await supabase
          .from('pre_match_reports')
          .insert({
            player_id: user.id,
            match_date: match.match_date,
            opponent: match.opponent,
            questions_answers: answers,
            actions: existingActions,
            havaya: existingHavaya,
            status: 'completed'
          })
          .select()
          .single();

        if (createError) throw createError;
        
        // Update match with new report id
        const { error: updateMatchError } = await supabase
          .from('matches')
          .update({ pre_match_report_id: newReport.id })
          .eq('id', matchId);

        if (updateMatchError) throw updateMatchError;
        
        reportId = newReport.id;
      } else {
        // Update existing report while preserving actions and havaya
        const { error: updateError } = await supabase
          .from('pre_match_reports')
          .update({ 
            questions_answers: answers,
            status: 'completed'
          })
          .eq('id', reportId);

        if (updateError) throw updateError;
      }

      // Get the complete report data for summary
      const { data: report } = await supabase
        .from('pre_match_reports')
        .select('actions, havaya')
        .eq('id', reportId)
        .single();

      // Set summary data and show summary view
      setSummaryData({
        matchDate: match.match_date,
        opponent: match.opponent,
        position: match.player_position,
        havaya: report?.havaya || '',
        actions: Array.isArray(report?.actions) ? report.actions as Action[] : [],
        answers
      });
      setShowSummary(true);

    } catch (error) {
      console.error('Error saving answers:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת התשובות",
        variant: "destructive",
      });
    }
  };

  if (showSummary && summaryData) {
    return <PreMatchSummaryView {...summaryData} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-right">שאלות טרום משחק</h1>
      <PreMatchQuestionnaire onSubmit={handleSubmit} />
    </div>
  );
};