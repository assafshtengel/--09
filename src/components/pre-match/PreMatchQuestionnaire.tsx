import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const allQuestions = [
  "מהי המטרה העיקרית שלך במשחק הקרוב?",
  "מהן שלוש החוזקות שלך כשחקן?",
  "איך אתה מתמודד עם לחץ במהלך משחק?",
  "באיזה תחום היית רוצה להשתפר משמעותית במשחק הבא?",
  "מה המוטיבציה העיקרית שלך לשחק?",
  "איך אתה מתכונן מנטלית למשחק?"
];

interface PreMatchQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void;
}

export const PreMatchQuestionnaire = ({ onSubmit }: PreMatchQuestionnaireProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(answers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {allQuestions.map((question, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-right font-medium">
              {question}
            </label>
            <Textarea
              value={answers[question] || ""}
              onChange={(e) => handleAnswerChange(question, e.target.value)}
              className="w-full text-right"
              placeholder="הכנס את תשובתך כאן..."
              required
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit">המשך</Button>
      </div>
    </form>
  );
};