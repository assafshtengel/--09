import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

const questions = [
  "מהי המטרה העיקרית שלך במשחק הקרוב (לא קשור לתוצאה)?",
  "מהן שלוש החוזקות שלך כשחקן?",
  "איך אתה מתמודד עם לחץ במהלך משחק?",
  "באיזה תחום היית רוצה להשתפר משמעותית במשחק הבא?",
  "מה המוטיבציה העיקרית שלך לשחק?",
  "איך אתה מתכונן מנטלית למשחק?",
  "מה הדבר שהכי מאתגר אותך במשחק?",
  "איך אתה מתמודד עם טעויות במהלך משחק?",
  "מה עוזר לך להישאר ממוקד במהלך המשחק?",
  "איך אתה מתקשר עם חברי הקבוצה שלך?",
];

export const PreMatchQuestionnaire = () => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const selectedQuestions = questions.slice(0, 6); // Take first 6 questions for now

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const takeScreenshot = async () => {
    try {
      const element = document.getElementById('questionnaire');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = 'pre-match-questionnaire.png';
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "צילום מסך הושלם",
          description: "התמונה נשמרה בהצלחה",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לצלם את המסך",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div id="questionnaire" className="space-y-6">
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
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button onClick={takeScreenshot}>
          צלם מסך
        </Button>
      </div>
    </div>
  );
};