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
  status: GamePhase;
  team?: string;
  team_name?: string;
  player_role?: string;
  match_type?: string;
  pre_match_report?: PreMatchReport;
}