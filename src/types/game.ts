export interface ActionLog {
  id: string;
  matchId: string;
  actionId: string;
  minute: number;
  result: string;
  note?: string;
}

export interface PreMatchReportActions {
  id: string;
  name: string;
  isSelected: boolean;
}

export interface PreMatchReport {
  actions: PreMatchReportActions[];
  havaya?: string;
  questions_answers: Record<string, any>;
}

export interface MatchData {
  id: string;
  player_id: string;
  match_date: string;
  opponent?: string;
  location?: string;
  status: 'preview' | 'first_half' | 'halftime' | 'second_half' | 'completed';
  team?: string;
  team_name?: string;
  player_role?: string;
  match_type?: string;
  pre_match_report?: PreMatchReport | null;
}