import { Json } from "@/integrations/supabase/types";

interface Action {
  [key: string]: Json;
  name: string;
  goal?: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface GameHistoryItem {
  id: string;
  match_date: string;
  opponent: string | null;
  pre_match_report?: {
    actions: Action[];
    questions_answers: QuestionAnswer[];
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

export interface PreMatchReport {
  id: string;
  match_date: string;
  opponent: string | null;
  actions: Action[];
  questions_answers: QuestionAnswer[];
  havaya?: string;
  status: 'draft' | 'completed';
  created_at?: string;
  updated_at?: string;
}