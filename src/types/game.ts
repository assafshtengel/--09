export interface PreMatchReportActions {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
}

export interface ActionLog {
  action_id: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

export interface MatchData {
  id: string;
  player_id: string;
  match_date: string;
  opponent?: string;
  location?: string;
  status: string;
  pre_match_report?: {
    actions: PreMatchReportActions[];
    havaya?: string;
    questions_answers: Record<string, any>;
  };
}