export type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";

export interface ActionLog {
  id: string;
  matchId: string;
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

export interface PreMatchReportActions {
  id: string;
  name: string;
  isSelected: boolean;
  goal?: string;
}

export interface PreMatchReport {
  id: string;
  player_id: string;
  match_date: string;
  match_time?: string;
  opponent?: string;
  actions: PreMatchReportActions[];
  questions_answers: Record<string, any>;
  ai_insights?: string[];
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  havaya?: string;
}

export interface MatchData {
  id: string;
  player_id: string;
  created_at: string;
  match_date: string;
  opponent?: string;
  location?: string;
  status: GamePhase;
  pre_match_report_id?: string;
  match_type?: string;
  final_score?: string;
  player_position?: string;
  team?: string;
  team_name?: string;
  player_role?: string;
  pre_match_report?: PreMatchReport;
}