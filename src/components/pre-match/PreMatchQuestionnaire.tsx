import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const allQuestions = [
  "מהי המטרה העיקרית שלך במשחק הקרוב?",
  "מהן שלוש החוזקות שלך כשחקן?",
  "איך אתה מתמודד עם לחץ במהלך משחק?",
  "באיזה תחום היית רוצה להשתפר משמעותית במשחק הבא?",
  "מה המוטיבציה העיקרית שלך לשחק?",
  "איך אתה מתכונן מנטלית למשחק?",
  "מה הדבר שהכי מאתגר אותך במשחק?",
  "איך אתה מתמודד עם טעויות במהלך משחק?",
  "מה עוזר לך להישאר ממוקד במהלך המשחק?",
  "איך אתה מתקשר עם חברי הקבוצה שלך?",
  "מה הציפיות שלך מעצמך במשחק הזה?",
  "איך אתה מתכוון להתמודד עם אתגרים במשחק?",
  "מה תעשה אם תרגיש שאתה מאבד ריכוז?",
  "איך אתה מתכנן לתרום לקבוצה במשחק הזה?",
  "מה יעזור לך להצליח במשחק הזה?",
  "איך אתה מתכונן פיזית למשחק?",
  "מה המחשבות שלך על היריב?",
  "איך אתה מתמודד עם שינויים בתכנית המשחק?",
  "מה עוזר לך להירגע לפני משחק?",
  "איך אתה שומר על אנרגיה במהלך המשחק?",
  "מה אתה עושה כשאתה מרגיש עייף?",
  "איך אתה מתמודד עם ביקורת?",
  "מה מניע אותך להצליח?",
  "איך אתה מתכנן להתאושש אחרי המשחק?",
  "מה אתה עושה כשאתה מרגיש חוסר ביטחון?",
  "איך אתה מתמודד עם כישלון?",
  "מה עוזר לך להתרכז בזמן אימונים?",
  "איך אתה מתכונן ליום המשחק?",
  "מה אתה עושה כשאתה מרגיש לחוץ?",
  "איך אתה מתמודד עם הצלחה?"
];

interface PreMatchQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void;
}

export const PreMatchQuestionnaire = ({ onSubmit }: PreMatchQuestionnaireProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Select 5 random questions
  const selectedQuestions = useState(() => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
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