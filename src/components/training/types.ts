export interface TrainingSummaryFormData {
  trainingDate: Date;
  trainingTime: string;
  satisfactionRating: number;
  challengeHandlingRating: number;
  energyFocusRating: number;
  answers: Record<string, string>;
}