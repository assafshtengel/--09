import { Json } from "@/integrations/supabase/types";

export interface GameHistoryItem {
  id: string;
  match_date: string;
  opponent: string | null;
  pre_match_report?: {
    actions: Json;
    questions_answers: Json;
    havaya?: string;
  };
  match_actions?: {
    id: string;
    match_id: string;
    action_id: string;
    minute: number;
    result: string;
    note: string | null;
  }[];
}