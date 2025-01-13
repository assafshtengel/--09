export type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";

export interface PreMatchReportAction {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
}

export interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

export interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

export interface Game {
  id: string;
  match_date: string;
  opponent: string | null;
  match_id?: string;
  status: string;
}

export interface PreMatchReport {
  actions: PreMatchReportAction[];
  questions_answers: Record<string, any>;
  havaya?: string;
}

export interface Match {
  id: string;
  player_id: string;
  created_at: string;
  match_date: string;
  opponent: string | null;
  location: string | null;
  status: string;
  pre_match_report_id: string | null;
  match_type: string | null;
  final_score: string | null;
  player_position: string | null;
  team: string | null;
  team_name: string | null;
  player_role: string | null;
  observer_type?: string;
  pre_match_reports?: PreMatchReport;
}