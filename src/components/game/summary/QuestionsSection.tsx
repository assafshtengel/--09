import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

const OPEN_ENDED_QUESTIONS = [
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
  "האם הייתה במהלך המשחק הערה מהמאמן/מהקהל/משחקן הקבוצה/מהיריב שהוציאה אותך מאיזון וגרמה לך למחשבות שלא קשורות למשחק? במידה וכן נא תפרט",
  "מה אתה לומד מהמשחק הזה להמשך הדרך?",
  "אם אתה מאמן הקבוצה איזה שינויים או מה היית שם דגש בקבוצה במהלך השבוע על מנת שנשתפר כקבוצה",
  "נא רשום סיכום מלא שלך על המשחק"
];

export interface QuestionsSectionProps {
  onAnswersChange: (answers: Record<string, any>) => void;
}

export const QuestionsSection = ({ onAnswersChange }: QuestionsSectionProps) => {
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [selfRating, setSelfRating] = useState<number>(5);
  const [openEndedAnswers, setOpenEndedAnswers] = useState<Record<string, string>>({});
  
  // Select 3 random questions
  const [selectedQuestions] = useState(() => {
    const shuffled = [...OPEN_ENDED_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  const handleAnswerChange = (question: string, answer: string) => {
    const newAnswers = {
      ...openEndedAnswers,
      [question]: answer
    };
    setOpenEndedAnswers(newAnswers);
    
    onAnswersChange({
      stressLevel,
      selfRating,
      openEndedAnswers: newAnswers
    });
  };

  const handleStressLevelChange = (value: number[]) => {
    setStressLevel(value[0]);
    onAnswersChange({
      stressLevel: value[0],
      selfRating,
      openEndedAnswers
    });
  };

  const handleSelfRatingChange = (value: number[]) => {
    setSelfRating(value[0]);
    onAnswersChange({
      stressLevel,
      selfRating: value[0],
      openEndedAnswers
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>שאלות נוספות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>מה רמת הלחץ שבה היית לפני המשחק? (1 הכי גרוע, 10 הטוב ביותר)</Label>
            <div className="pt-2">
              <Slider
                value={[stressLevel]}
                onValueChange={handleStressLevelChange}
                max={10}
                min={1}
                step={1}
              />
              <div className="text-center mt-2">{stressLevel}</div>
            </div>
          </div>

          <div>
            <Label>איזה ציון אתה נותן לעצמך על המשחק? (1 הכי גרוע, 10 הטוב ביותר)</Label>
            <div className="pt-2">
              <Slider
                value={[selfRating]}
                onValueChange={handleSelfRatingChange}
                max={10}
                min={1}
                step={1}
              />
              <div className="text-center mt-2">{selfRating}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedQuestions.map((question, index) => (
            <div key={index}>
              <Label>{question}</Label>
              <Textarea
                value={openEndedAnswers[question] || ""}
                onChange={(e) => handleAnswerChange(question, e.target.value)}
                className="mt-2"
                dir="rtl"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};