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
  observer_type?: "parent" | "player";
}

export interface PreMatchReport {
  id: string;
  match_id: string;
  actions: PreMatchReportActions[];
}

export interface PreMatchReportActions {
  id: string;
  name: string;
  isSelected: boolean;
  goal?: boolean;
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

export type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";
