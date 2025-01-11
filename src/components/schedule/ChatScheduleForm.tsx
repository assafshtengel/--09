import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  type: 'system' | 'user';
  content: string;
  options?: string[];
  inputType?: 'time' | 'text' | 'multiSelect' | 'number';
  dayId?: string;
}

interface Question {
  content: string;
  inputType: 'time' | 'text' | 'multiSelect' | 'number';
  options?: string[];
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
    schoolDays: {},
    sleep: {},
    phoneTime: {},
    teamPractices: [],
    personalTraining: [],
    games: [],
    notes: '',
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const days = [
    { id: 'sunday', label: 'ראשון' },
    { id: 'monday', label: 'שני' },
    { id: 'tuesday', label: 'שלישי' },
    { id: 'wednesday', label: 'רביעי' },
    { id: 'thursday', label: 'חמישי' },
    { id: 'friday', label: 'שישי' },
    { id: 'saturday', label: 'שבת' },
  ];

  const questions: Question[] = [
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
  ];

  const handleDaySelection = async (dayId: string, checked: boolean) => {
    try {
      if (checked) {
        setSelectedDays(prev => [...prev, dayId]);
        setMessages(prev => [...prev, {
          type: 'system',
          content: `מה השעות שלך ביום ${days.find(d => d.id === dayId)?.label}?`,
          inputType: 'time',
          dayId: dayId,
        }]);
      } else {
        setSelectedDays(prev => prev.filter(d => d !== dayId));
      }
    } catch (error) {
      console.error('Error handling day selection:', error);
    }
  };

  const handleTimeInput = async (dayId: string, time: string) => {
    try {
      const updatedSchedule = { ...schedule };
      updatedSchedule.schoolDays[dayId] = time;
      setSchedule(updatedSchedule);
      onScheduleChange(updatedSchedule);
    } catch (error) {
      console.error('Error handling time input:', error);
    }
  };

  const handleNextQuestion = async () => {
    try {
      if (currentStep < questions.length) {
        const nextQuestion = questions[currentStep];
        setMessages(prev => [...prev, {
          type: 'system',
          content: nextQuestion.content,
          inputType: nextQuestion.inputType,
          options: nextQuestion.options,
        }]);
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error handling next question:', error);
    }
  };

  const handleUserResponse = async (response: any) => {
    try {
      setMessages(prev => [...prev, {
        type: 'user',
        content: typeof response === 'string' ? response : JSON.stringify(response),
      }]);
      
      const updatedSchedule = { ...schedule };
      // Update schedule based on the current step and response
      
      setSchedule(updatedSchedule);
      onScheduleChange(updatedSchedule);
      
      handleNextQuestion();
    } catch (error) {
      console.error('Error handling user response:', error);
    }
  };

  const renderInput = (message: Message) => {
    switch (message.inputType) {
      case 'multiSelect':
        return (
          <div className="space-y-2">
            {message.options?.map((option, index) => (
              <div key={option} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={days[index].id}
                  onCheckedChange={(checked) => {
                    handleDaySelection(days[index].id, checked as boolean);
                  }}
                />
                <Label htmlFor={days[index].id}>{option}</Label>
              </div>
            ))}
          </div>
        );
      
      case 'time':
        return (
          <div className="space-y-2">
            <Input
              type="time"
              className="w-full bg-white border-black"
              onChange={(e) => {
                if (message.dayId) {
                  handleTimeInput(message.dayId, e.target.value);
                } else {
                  handleUserResponse(e.target.value);
                }
              }}
            />
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <Input
              type="number"
              className="w-full bg-white border-black"
              onChange={(e) => handleUserResponse(e.target.value)}
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Input
              className="w-full bg-white border-black"
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
                    ? 'bg-white border border-black text-black'
                    : 'bg-black text-white'
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
          className="w-full bg-black text-white hover:bg-gray-800"
          onClick={handleNextQuestion}
        >
          בוא נתחיל
        </Button>
      )}
    </div>
  );
};
