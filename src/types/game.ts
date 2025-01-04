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

export interface Game {
  id: string;
  match_date: string;
  opponent: string | null;
  match_id?: string;
  status: "completed" | "preview";
}
