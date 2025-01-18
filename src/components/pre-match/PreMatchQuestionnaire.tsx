import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Play } from "lucide-react";
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
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-right text-2xl font-bold text-[#333333]">
          שאלון טרום משחק
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Fixed Questions */}
        {FIXED_QUESTIONS.map((item, index) => (
          <div 
            key={index} 
            className="p-6 rounded-lg border border-[#dddddd] bg-white shadow-sm space-y-4"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
                <Label 
                  className="flex-1 text-right text-[22px] font-bold text-[#333333] leading-tight"
                >
                  {item.question}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-[#0056b3]/10 transition-colors whitespace-nowrap min-w-[180px] text-[16px] border-[#dddddd]"
                  onClick={() => openExplanationVideo(item.videoUrl)}
                >
                  <Play className="h-4 w-4" />
                  <span>{item.buttonText}</span>
                </Button>
              </div>
              <p className="text-[18px] text-[#666666] text-right">
                {item.guidance}
              </p>
            </div>
            <Textarea
              value={answers[item.question] || ""}
              onChange={(e) => handleAnswerChange(item.question, e.target.value)}
              className="min-h-[100px] text-[16px] w-full sm:w-[90%] mx-auto block bg-[#f2f2f2] border-[#dddddd] rounded-md p-4"
              placeholder="הקלד את תשובתך כאן..."
              dir="rtl"
            />
          </div>
        ))}

        {/* Random Questions */}
        {randomQuestions.map((question, index) => (
          <div 
            key={index} 
            className="p-6 rounded-lg border border-[#dddddd] bg-white shadow-sm space-y-4"
          >
            <Label 
              className="block text-right text-[22px] font-bold text-[#333333] leading-tight"
            >
              {question}
            </Label>
            <Textarea
              value={answers[question] || ""}
              onChange={(e) => handleAnswerChange(question, e.target.value)}
              className="min-h-[100px] text-[16px] w-full sm:w-[90%] mx-auto block bg-[#f2f2f2] border-[#dddddd] rounded-md p-4"
              placeholder="הקלד את תשובתך כאן..."
              dir="rtl"
            />
          </div>
        ))}

        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleSubmit}
            className="px-8 py-3 text-[16px] bg-[#0056b3] hover:bg-[#004494] transition-colors text-white rounded-md shadow-sm"
            size="lg"
          >
            המשך
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};