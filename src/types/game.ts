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

export type ReportStatus = 'draft' | 'completed';

export interface PreMatchReport {
  id: string;
  player_id: string;
  match_date: string;
  match_time?: string;
  opponent?: string;
  actions: PreMatchReportActions[];
  questions_answers: Record<string, any>;
  ai_insights?: string[];
  status: ReportStatus;
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
  status: string;
  pre_match_report?: {
    actions: PreMatchReportActions[];
    havaya?: string;
    questions_answers: Record<string, any>;
  };
  match_type?: string;
  final_score?: string;
  player_position?: string;
  team?: string;
  team_name?: string;
  player_role?: string;
}