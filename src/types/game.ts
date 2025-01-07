export type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";

export type PreMatchReportActions = {
  id: string;
  name: string;
  goal?: string;
  isSelected: boolean;
};

export type ActionLog = {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
};

export type SubstitutionLog = {
  playerIn: string | null;
  playerOut: string | null;
  minute: number;
};

export type Match = {
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
};