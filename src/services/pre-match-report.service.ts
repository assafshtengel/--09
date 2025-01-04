import { supabase } from "@/integrations/supabase/client";
import { Action } from "@/components/ActionSelector";
import { Json } from "@/integrations/supabase/types";

export interface PreMatchReportData {
  player_id: string;
  match_date: string;
  opponent?: string;
  actions: Action[];
  havaya?: string;
  questions_answers?: Record<string, string>;
}

export const createOrUpdatePreMatchReport = async (data: PreMatchReportData, reportId?: string) => {
  const reportData = {
    player_id: data.player_id,
    match_date: data.match_date,
    opponent: data.opponent,
    actions: JSON.stringify(data.actions) as Json,
    havaya: data.havaya,
    status: 'draft' as const,
  };

  if (reportId) {
    const { data: report, error } = await supabase
      .from('pre_match_reports')
      .update(reportData)
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return report;
  } else {
    const { data: report, error } = await supabase
      .from('pre_match_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) throw error;
    return report;
  }
};

export const updatePreMatchReportAnswers = async (reportId: string, answers: Record<string, string>) => {
  const { error } = await supabase
    .from('pre_match_reports')
    .update({
      questions_answers: answers as Json,
      status: 'completed' as const
    })
    .eq('id', reportId);

  if (error) throw error;
};