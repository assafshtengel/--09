import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink } from "lucide-react";
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
  // Add your existing pre-match questions here
];

interface PreMatchQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void;
}

export const PreMatchQuestionnaire = ({ onSubmit }: PreMatchQuestionnaireProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (question: string, answer: string) => {
    const newAnswers = { ...answers, [question]: answer };
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const openExplanationVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-right">שאלון טרום משחק</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fixed Questions */}
        {FIXED_QUESTIONS.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start gap-4">
                <Label className="flex-1 text-right">{item.question}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
                  onClick={() => openExplanationVideo(item.videoUrl)}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{item.buttonText}</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-right">{item.guidance}</p>
            </div>
            <Textarea
              value={answers[item.question] || ""}
              onChange={(e) => handleAnswerChange(item.question, e.target.value)}
              className="mt-2"
              dir="rtl"
            />
          </div>
        ))}

        {/* Additional Questions */}
        {ADDITIONAL_QUESTIONS.map((question, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-right">{question}</Label>
            <Textarea
              value={answers[question] || ""}
              onChange={(e) => handleAnswerChange(question, e.target.value)}
              className="mt-2"
              dir="rtl"
            />
          </div>
        ))}

        <div className="flex justify-end mt-6">
          <Button onClick={handleSubmit}>המשך</Button>
        </div>
      </CardContent>
    </Card>
  );
};