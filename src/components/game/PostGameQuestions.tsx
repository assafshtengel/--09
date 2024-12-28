import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

const QUESTIONS = [
  "מה רמת הלחץ שבה היית לפני המשחק?",
  "מה ציון המשחק שאתה נותן לעצמך?",
  "רשום את נקודות החוזקה שלך במשחק",
  "רשום את נקודות התורפה שלך במשחק",
  "מהו הדבר / הרגע האחד שהיה נקודת השיא שלך במשחק?",
  "מה היה הדבר/הרגע שבו הרגשת בנקודת השפל במשחק?",
  "מה הייתה המטרה האישית שלך במשחק?",
  "תפרט האם עמדת בה - אם כן בזכות מה ואם לא, מה הסיבה שלא עמדת בה",
  "האם קיבלת כרטיס אדום / צהוב ואם כן - מה הסיבה שקיבלת?",
  "האם הרגשת במהלך המשחק קושי גופני מסויים? נא תאר",
  "האם הרגשת במהלך המשחק קושי מנטאלי? נא תאר",
  "באיזה אופן ניתן היה לשפר את התרומה הטקטית שלך במשחק?",
  "האם הייתה במהלך המשחק הערה מהמאמן/מהקהל/משחקן הקבוצה/מהיריב שהוציאה אותך מאיזון? נא תפרט",
  "מה אתה לומד מהמשחק הזה להמשך הדרך?",
  "אם אתה מאמן הקבוצה איזה שינויים או מה היית שם דגש בקבוצה במהלך השבוע?"
];

interface PostGameQuestionsProps {
  onSubmit: (answers: Record<string, string | number>) => void;
}

export const PostGameQuestions = ({ onSubmit }: PostGameQuestionsProps) => {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Select 3 random questions
  const [selectedQuestions] = useState(() => {
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  const handleAnswer = (answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [selectedQuestions[currentQuestionIndex]]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      onSubmit(answers);
    }
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const isRatingQuestion = currentQuestion.includes("רמת") || currentQuestion.includes("ציון");

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-xl font-semibold text-right">
        שאלה {currentQuestionIndex + 1} מתוך {selectedQuestions.length}
      </h3>
      
      <p className="text-right mb-4">{currentQuestion}</p>

      {isRatingQuestion ? (
        <div className="space-y-4">
          <Slider
            min={1}
            max={10}
            step={1}
            value={[answers[currentQuestion] as number || 1]}
            onValueChange={(value) => handleAnswer(value[0])}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>הכי גרוע</span>
            <span>הטוב ביותר</span>
          </div>
        </div>
      ) : (
        <Textarea
          value={answers[currentQuestion] as string || ""}
          onChange={(e) => handleAnswer(e.target.value)}
          className="h-32 text-right"
          placeholder="הכנס את תשובתך כאן..."
        />
      )}

      <Button 
        onClick={handleNext}
        className="w-full"
      >
        {currentQuestionIndex === selectedQuestions.length - 1 ? "סיים" : "הבא"}
      </Button>
    </div>
  );
};