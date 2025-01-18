import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIXED_QUESTIONS = [
  {
    question: "מה המילה שמחזירה לך? (המילה שאתה אומר לעצמך ברגע שהביטחון מעט יורד)",
    videoUrl: "https://did.li/lior-WORD1",
    guidance: "זיהוי המילה האישית שלך יכול לעזור לך להתמודד טוב יותר עם רגעי לחץ",
    buttonText: "לסרטון הסבר לנושא - לחץ כאן"
  },
  {
    question: "איך אתה מתייחס ללחץ לפני משחק?",
    videoUrl: "https://did.li/videoai1",
    guidance: "הבנת היחס שלך ללחץ היא צעד חשוב בשיפור הביצועים שלך",
    buttonText: "לסרטון בנושא לחץ - לחץ כאן"
  }
];

const ADDITIONAL_QUESTIONS = [
  "רשום את נקודות החוזקה שלך במשחק",
  "רשום את נקודות התורפה שלך במשחק",
  "מהו הדבר / הרגע האחד שהיה נקודת השיא שלך במשחק?",
  "מה היה הדבר/הרגע שבו הרגשת בנקודת השפל במשחק?",
  "מה הייתה המטרה העיקרית שלך במשחק?",
  "מה הייתה המטרה העיקרית שלך במשחק והאם עמדת בה?",
  "האם קיבלת כרטיס אדום / צהוב ואם כן - מה הסיבה שקיבלת?",
  "האם הרגשת במהלך המשחק קושי גופני מסויים? נא תאר",
  "האם הרגשת במהלך המשחק קושי מנטאלי? נא תאר",
  "באיזה אופן ניתן היה לשפר את התרומה הטקטית שלך במשחק?"
];

interface PreMatchQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void;
}

export const PreMatchQuestionnaire = ({ onSubmit }: PreMatchQuestionnaireProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Select 3 random questions
  const [randomQuestions] = useState(() => {
    const shuffled = [...ADDITIONAL_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const openExplanationVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-right text-2xl font-bold">שאלון טרום משחק</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Fixed Questions */}
        {FIXED_QUESTIONS.map((item, index) => (
          <div key={index} className="space-y-4 p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
                <Label className="flex-1 text-right text-lg font-medium">{item.question}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-primary/10 transition-colors whitespace-nowrap min-w-[180px]"
                  onClick={() => openExplanationVideo(item.videoUrl)}
                >
                  <Play className="h-4 w-4" />
                  <span className="text-sm">{item.buttonText}</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-right">{item.guidance}</p>
            </div>
            <Textarea
              value={answers[item.question] || ""}
              onChange={(e) => handleAnswerChange(item.question, e.target.value)}
              className="min-h-[100px] text-base w-full sm:w-[90%] mx-auto block"
              placeholder="הקלד את תשובתך כאן..."
              dir="rtl"
            />
          </div>
        ))}

        {/* Random Questions */}
        {randomQuestions.map((question, index) => (
          <div key={index} className="space-y-3 p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
            <Label className="block text-right text-lg font-medium">{question}</Label>
            <Textarea
              value={answers[question] || ""}
              onChange={(e) => handleAnswerChange(question, e.target.value)}
              className="min-h-[100px] text-base w-full sm:w-[90%] mx-auto block"
              placeholder="הקלד את תשובתך כאן..."
              dir="rtl"
            />
          </div>
        ))}

        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleSubmit}
            className="px-8 py-2 text-lg bg-primary hover:bg-primary-hover transition-colors"
            size="lg"
          >
            המשך
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};