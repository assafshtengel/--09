import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the fixed questions with their video URLs and guidance text
const FIXED_QUESTIONS = [
  {
    question: 'מה המילה שמחזירה לך? (המילה שאתה אומר לעצמך ברגע שהביטחון מעט יורד)',
    videoUrl: 'https://did.li/lior-WORD1',
    guidance: 'זיהוי המילה האישית שלך יכול לעזור לך להתמודד טוב יותר עם רגעי לחץ',
    buttonText: 'לסרטון הסבר לנושא - לחץ כאן'
  },
  {
    question: 'איך אתה מתייחס ללחץ לפני משחק?',
    videoUrl: 'https://did.li/videoai1',
    guidance: 'הבנת היחס שלך ללחץ היא צעד חשוב בשיפור הביצועים שלך',
    buttonText: 'לסרטון בנושא לחץ - לחץ כאן'
  }
];

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

const STRESS_LEVELS = [
  { value: "1", label: "1 - רגוע מאוד" },
  { value: "2", label: "2 - רגוע" },
  { value: "3", label: "3 - רגוע יחסית" },
  { value: "4", label: "4 - מעט לחץ" },
  { value: "5", label: "5 - לחץ בינוני" },
  { value: "6", label: "6 - לחוץ" },
  { value: "7", label: "7 - לחוץ מאוד" },
  { value: "8", label: "8 - לחץ גבוה" },
  { value: "9", label: "9 - לחץ גבוה מאוד" },
  { value: "10", label: "10 - לחץ מקסימלי" }
];

const SELF_RATINGS = [
  { value: "1", label: "1 - חלש מאוד" },
  { value: "2", label: "2 - חלש" },
  { value: "3", label: "3 - מתחת לממוצע" },
  { value: "4", label: "4 - ממוצע" },
  { value: "5", label: "5 - מעל הממוצע" },
  { value: "6", label: "6 - טוב" },
  { value: "7", label: "7 - טוב מאוד" },
  { value: "8", label: "8 - מצוין" },
  { value: "9", label: "9 - יוצא מן הכלל" },
  { value: "10", label: "10 - מושלם" }
];

export interface QuestionsSectionProps {
  onAnswersChange: (answers: Record<string, any>) => void;
}

export const QuestionsSection = ({ onAnswersChange }: QuestionsSectionProps) => {
  const [stressLevel, setStressLevel] = useState<string>("5");
  const [selfRating, setSelfRating] = useState<string>("5");
  const [openEndedAnswers, setOpenEndedAnswers] = useState<Record<string, string>>({});
  
  // Select 3 random questions (in addition to the two fixed questions)
  const [selectedQuestions] = useState(() => {
    const shuffled = [...OPEN_ENDED_QUESTIONS].sort(() => 0.5 - Math.random());
    return [...FIXED_QUESTIONS.map(q => q.question), ...shuffled.slice(0, 3)];
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

  const openExplanationVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
          {selectedQuestions.map((question, index) => {
            const fixedQuestion = FIXED_QUESTIONS.find(q => q.question === question);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <Label className="flex-1">{question}</Label>
                    {fixedQuestion && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
                        onClick={() => openExplanationVideo(fixedQuestion.videoUrl)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>{fixedQuestion.buttonText}</span>
                      </Button>
                    )}
                  </div>
                  {fixedQuestion && (
                    <p className="text-sm text-muted-foreground">{fixedQuestion.guidance}</p>
                  )}
                </div>
                <Textarea
                  value={openEndedAnswers[question] || ""}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                  className="mt-2"
                  dir="rtl"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};