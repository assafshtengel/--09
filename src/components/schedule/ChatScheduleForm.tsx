import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Message {
  type: 'system' | 'user';
  content: string;
  options?: string[];
  inputType?: 'time' | 'text' | 'multiSelect' | 'number';
}

interface ChatScheduleFormProps {
  onScheduleChange: (schedule: any) => void;
}

export const ChatScheduleForm = ({ onScheduleChange }: ChatScheduleFormProps) => {
  const [messages, setMessages] = useState<Message[]>([{
    type: 'system',
    content: 'ברוך הבא לתכנון השבועי שלך! בוא נתחיל עם כמה שאלות כדי ליצור עבורך לוח זמנים מותאם אישית.',
  }]);
  const [currentStep, setCurrentStep] = useState(0);
  const [schedule, setSchedule] = useState<any>({
    sleep: {},
    phoneTime: {},
    teamPractices: [],
    personalTraining: [],
    games: [],
    notes: '',
  });

  const days = [
    { id: 'sunday', label: 'ראשון' },
    { id: 'monday', label: 'שני' },
    { id: 'tuesday', label: 'שלישי' },
    { id: 'wednesday', label: 'רביעי' },
    { id: 'thursday', label: 'חמישי' },
    { id: 'friday', label: 'שישי' },
    { id: 'saturday', label: 'שבת' },
  ];

  const questions = [
    {
      content: 'באילו ימים אתה בבית ספר?',
      inputType: 'multiSelect',
      options: days.map(day => day.label),
    },
    {
      content: 'מה שעות השינה שלך?',
      inputType: 'time',
    },
    {
      content: 'כמה זמן אתה בטלפון ביום?',
      inputType: 'number',
    },
    {
      content: 'מתי יש לך אימוני קבוצה?',
      inputType: 'text',
    },
    // ... Add more questions as needed
  ];

  const handleNextQuestion = () => {
    if (currentStep < questions.length) {
      setMessages(prev => [...prev, {
        type: 'system',
        content: questions[currentStep].content,
        inputType: questions[currentStep].inputType,
        options: questions[currentStep].options,
      }]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleUserResponse = (response: any) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: typeof response === 'string' ? response : JSON.stringify(response),
    }]);

    // Update schedule based on the current step and response
    const updatedSchedule = { ...schedule };
    // Add logic to update the schedule based on the current step
    
    setSchedule(updatedSchedule);
    onScheduleChange(updatedSchedule);
    
    handleNextQuestion();
  };

  const renderInput = (message: Message) => {
    switch (message.inputType) {
      case 'multiSelect':
        return (
          <div className="space-y-2">
            {message.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={option}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleUserResponse([option]);
                    }
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );
      
      case 'time':
        return (
          <div className="space-y-2">
            <Input
              type="time"
              className="w-full"
              onChange={(e) => handleUserResponse(e.target.value)}
            />
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              className="w-full"
              onChange={(e) => handleUserResponse(e.target.value)}
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Input
              className="w-full"
              onChange={(e) => handleUserResponse(e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'system' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.type === 'system'
                    ? 'bg-secondary'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p>{message.content}</p>
                {message.inputType && renderInput(message)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {currentStep === 0 && (
        <Button
          className="w-full"
          onClick={handleNextQuestion}
        >
          בוא נתחיל
        </Button>
      )}
    </div>
  );
};