import { Json } from "@/integrations/supabase/types";

export interface Action {
  name: string;
  goal?: string;
  [key: string]: Json;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
  [key: string]: Json;
}

export interface GameHistoryItem {
  id: string;
  match_date: string;
  opponent: string | null;
  status: string;
  location?: string | null;
  match_type?: string | null;
  pre_match_report?: {
    actions: Action[] | Json;
    questions_answers: QuestionAnswer[] | Json;
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