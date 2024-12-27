import { useEffect } from "react";

const FIXED_QUESTIONS = [
  "מה הלקח העיקרי שלמדת מהאימון היום?",
  "תאר אתגר ספציפי שנתקלת בו ואיך התמודדת איתו",
  "איזה כישור או תחום דורש תשומת לב נוספת בפעם הבאה?"
];

interface QuestionSelectorProps {
  onQuestionsSelected: (questions: string[]) => void;
}

export const QuestionSelector = ({ onQuestionsSelected }: QuestionSelectorProps) => {
  useEffect(() => {
    onQuestionsSelected(FIXED_QUESTIONS);
  }, [onQuestionsSelected]);

  return null;
};