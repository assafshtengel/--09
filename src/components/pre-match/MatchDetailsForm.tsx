import { useState } from "react";
import { PreMatchExplanationDialog } from "./PreMatchExplanationDialog";
import { MatchQuestionDialog } from "./MatchQuestionDialog";

interface MatchDetails {
  date: string;
  time?: string | null;
  opponent?: string;
  location?: string;
  position?: string;
  match_type?: string;
}

interface MatchDetailsFormProps {
  onSubmit: (details: MatchDetails) => void;
  initialData: MatchDetails;
}

const QUESTIONS = [
  {
    id: "date",
    label: "מתי המשחק?",
    type: "date" as const,
  },
  {
    id: "time",
    label: "באיזו שעה המשחק?",
    type: "time" as const,
  },
  {
    id: "opponent",
    label: "נגד מי אתם משחקים?",
    type: "text" as const,
  },
  {
    id: "match_type",
    label: "מהו סוג המשחק?",
    type: "select" as const,
    options: [
      { value: "cup", label: "גביע" },
      { value: "league", label: "ליגה" },
      { value: "friendly", label: "ידידות" },
      { value: "other", label: "אחר" },
    ],
  },
  {
    id: "position",
    label: "באיזה תפקיד תשחק במשחק?",
    type: "select" as const,
    options: [
      { value: "forward", label: "חלוץ" },
      { value: "midfielder", label: "קשר" },
      { value: "defender", label: "מגן" },
      { value: "goalkeeper", label: "שוער" },
      { value: "centerback", label: "בלם" },
      { value: "winger", label: "כנף" },
    ],
  },
];

export const MatchDetailsForm = ({ onSubmit, initialData }: MatchDetailsFormProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<MatchDetails>({
    date: initialData.date,
    time: initialData.time || "",
    opponent: initialData.opponent || "",
    position: initialData.position || "forward",
    match_type: initialData.match_type || "friendly",
  });

  const handleQuestionSubmit = (value: string) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowExplanation(true);
    }
  };

  const handleContinue = () => {
    onSubmit(answers);
  };

  return (
    <div className="space-y-4">
      <MatchQuestionDialog
        isOpen={currentQuestionIndex < QUESTIONS.length}
        onClose={() => {}}
        question={QUESTIONS[currentQuestionIndex]}
        value={answers[QUESTIONS[currentQuestionIndex].id as keyof MatchDetails] || ""}
        onSubmit={handleQuestionSubmit}
      />

      <PreMatchExplanationDialog
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        onContinue={handleContinue}
      />
    </div>
  );
};