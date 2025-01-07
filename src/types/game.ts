export type GamePhase = "preview" | "observer_selection" | "playing" | "halftime" | "secondHalf" | "ended";

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

export interface Game {
  id: string;
  match_date: string;
  opponent: string | null;
  match_id?: string;
  status: "completed" | "preview";
}

export interface Action {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean; // Changed from optional to required
}

export interface Match {
  id?: string;
  player_id?: string;
  created_at?: string;
  match_date?: string;
  opponent?: string;
  location?: string;
  status?: string;
  pre_match_report_id?: string;
  match_type?: string;
  final_score?: string;
  player_position?: string;
  team?: string;
  team_name?: string;
  player_role?: string;
  observer_type?: "parent" | "player";
  pre_match_reports?: {
    actions?: PreMatchReportActions[];
  };
}