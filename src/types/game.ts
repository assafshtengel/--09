export type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";

export interface PreMatchReportActions {
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

export interface MatchData {
  id: string;
  created_at: string;
  location: string | null;
  match_date: string;
  opponent: string | null;
  player_id: string;
  pre_match_report_id: string | null;
  status: string;
  team_name?: string;
  player_role?: string;
  match_type?: string;
  pre_match_report?: {
    actions?: PreMatchReportActions[] | null;
    questions_answers?: Record<string, any> | null;
    havaya?: string | null;
  } | null;
}