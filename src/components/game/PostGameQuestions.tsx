import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

const allQuestions = [
  "מה הלקח העיקרי שלמדת מהמשחק היום?",
  "תאר אתגר ספציפי שנתקלת בו ואיך התמודדת איתו",
  "איזה כישור או תחום דורש תשומת לב נוספת בפעם הבאה?"
];

interface PostGameQuestionsProps {
  onSubmit: (answers: Record<string, string>) => void;
}

export const PostGameQuestions = ({ onSubmit }: PostGameQuestionsProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Select 3 random questions
  const selectedQuestions = useState(() => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  })[0];

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
        {selectedQuestions.map((question, index) => (
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