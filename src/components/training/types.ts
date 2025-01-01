export interface TrainingSummaryFormData {
  trainingDate: Date;
  trainingTime: string;
  satisfactionRating: number;
  challengeHandlingRating: number;
  energyFocusRating: number;
  answers: Record<string, string>;
}

export interface TrainingSummary {
  id: string;
  player_id: string;
  training_date: string;
  training_time: string;
  satisfaction_rating: number;
  challenge_handling_rating: number;
  energy_focus_rating: number;
  questions_answers: Record<string, string>;
  created_at: string;
}

export interface TrainingSummaryFormProps {
  onSubmitSuccess: () => void;
}

export interface TrainingSummaryListProps {
  summaries: TrainingSummary[];
}