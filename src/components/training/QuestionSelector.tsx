import { useEffect, useState } from "react";

const ALL_QUESTIONS = [
  "מה הלקח העיקרי שלמדת מהאימון היום?",
  "תאר אתגר ספציפי שנתקלת בו ואיך התמודדת איתו",
  "איזה כישור או תחום דורש תשומת לב נוספת בפעם הבאה?",
  "איזה חלק מהאימון היה המתגמל ביותר, ולמה?",
  "האם יש משהו שהיית עושה אחרת אם היית יכול לחזור על האימון של היום?",
  "איך אתה מתכנן ליישם את מה שלמדת באימונים/משחקים הבאים?"
];

interface QuestionSelectorProps {
  onQuestionsSelected: (questions: string[]) => void;
}

export const QuestionSelector = ({ onQuestionsSelected }: QuestionSelectorProps) => {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  useEffect(() => {
    // Randomly select 3 questions
    const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setSelectedQuestions(selected);
    onQuestionsSelected(selected);
  }, [onQuestionsSelected]);

  return null; // This component doesn't render anything, it just manages question selection
};