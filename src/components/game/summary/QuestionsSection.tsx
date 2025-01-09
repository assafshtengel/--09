import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPEN_ENDED_QUESTIONS = [
  "רשום את נקודות החוזקה שלך במשחק",
  "רשום את נקודות התורפה שלך במשחק",
  "מהו הדבר / הרגע האחד שהיה נקודת השיא שלך במשחק?",
  "מה היה הדבר/הרגע שבו הרגשת בנקודת השפל במשחק?",
  "מה הייתה המטרה העיקרית שלך במשחק?",
  "מה הייתה המטרה העיקרית שלך במשחק והאם עמדת בה? אם כן, בזכות מה? אם לא, מה הסיבה שלא עמדת בה?",
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
  const [stressLevel, setStressLevel] = useState<string>("5");
  const [selfRating, setSelfRating] = useState<string>("5");
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
      stressLevel: parseInt(stressLevel),
      selfRating: parseInt(selfRating),
      openEndedAnswers: newAnswers
    });
  };

  const handleStressLevelChange = (value: string) => {
    setStressLevel(value);
    onAnswersChange({
      stressLevel: parseInt(value),
      selfRating: parseInt(selfRating),
      openEndedAnswers
    });
  };

  const handleSelfRatingChange = (value: string) => {
    setSelfRating(value);
    onAnswersChange({
      stressLevel: parseInt(stressLevel),
      selfRating: parseInt(value),
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
          <div className="space-y-2">
            <Label>מה רמת הלחץ שבה היית לפני המשחק?</Label>
            <Select
              value={stressLevel}
              onValueChange={handleStressLevelChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר רמת לחץ" />
              </SelectTrigger>
              <SelectContent>
                {STRESS_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>איזה ציון אתה נותן לעצמך על המשחק?</Label>
            <Select
              value={selfRating}
              onValueChange={handleSelfRatingChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="בחר ציון" />
              </SelectTrigger>
              <SelectContent>
                {SELF_RATINGS.map((rating) => (
                  <SelectItem key={rating.value} value={rating.value}>
                    {rating.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
