export type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";

export interface PreMatchReportActions {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
}

export interface ActionLog {
  action_id: string;  // Changed from actionId to match database
  minute: number;
  result: "success" | "failure";
  note?: string;
}

export interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

export interface PreMatchReport {
  id: string;
  player_id: string;
  match_date: string;
  status: "draft" | "completed";
  actions: PreMatchReportActions[];
  havaya?: string;
  questions_answers: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MatchData {
  id: string;
  player_id: string;
  match_date: string;
  opponent?: string;
  location?: string;
  status: GamePhase;
  pre_match_report?: PreMatchReport;
}