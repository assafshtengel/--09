import { Textarea } from "@/components/ui/textarea";

interface QuestionsSectionProps {
  answers: Record<string, string>;
  onAnswerChange: (question: string, answer: string) => void;
}

const POST_GAME_QUESTIONS = [
  "תאר אתגר ספציפי שנתקלת בו במשחק ואיך התמודדת איתו",
  "איזה לקח עיקרי למדת מהמשחק היום?",
  "מה הלקח העיקרי שלמדת מהמחצית היום?"
];

export const QuestionsSection = ({ answers, onAnswerChange }: QuestionsSectionProps) => {
  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold text-right">שאלות סיכום</h3>
      <div className="space-y-4">
        {POST_GAME_QUESTIONS.map((question, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-right font-medium">
              {question}
            </label>
            <Textarea
              value={answers[question] || ""}
              onChange={(e) => onAnswerChange(question, e.target.value)}
              className="w-full text-right"
              placeholder="הכנס את תשובתך כאן..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};