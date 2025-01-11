import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  type: 'system' | 'user';
  content: string;
  options?: string[];
  inputType?: 'multiSelect';
}

interface ChatScheduleFormProps {
  onScheduleChange: (schedule: any) => void;
}

export const ChatScheduleForm = ({ onScheduleChange }: ChatScheduleFormProps) => {
  const [messages, setMessages] = useState<Message[]>([{
    type: 'system',
    content: 'ברוך הבא! בוא ניצור יחד את לוח הזמנים השבועי שלך. אשאל אותך כמה שאלות קצרות, וניצור את התוכנית המושלמת בשבילך.',
  }]);
  const [currentStep, setCurrentStep] = useState(0);
  const [schedule, setSchedule] = useState<any>({
    schoolDays: [],
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const days = [
    'אין לימודים השבוע',
    'ראשון',
    'שני',
    'שלישי',
    'רביעי',
    'חמישי',
    'שישי',
  ];

  const handleDaySelection = (day: string, checked: boolean) => {
    if (day === 'אין לימודים השבוע') {
      if (checked) {
        setSelectedDays(['אין לימודים השבוע']);
      } else {
        setSelectedDays([]);
      }
    } else {
      if (checked) {
        setSelectedDays(prev => 
          prev.includes('אין לימודים השבוע') 
            ? [day]
            : [...prev, day]
        );
      } else {
        setSelectedDays(prev => prev.filter(d => d !== day));
      }
    }

    const updatedSchedule = { ...schedule };
    updatedSchedule.schoolDays = selectedDays;
    setSchedule(updatedSchedule);
    onScheduleChange(updatedSchedule);
  };

  const handleNextQuestion = () => {
    setMessages(prev => [...prev, {
      type: 'system',
      content: 'באילו ימים יש לך בית ספר השבוע?',
      inputType: 'multiSelect',
      options: days,
    }]);
    setCurrentStep(prev => prev + 1);
  };

  const renderInput = (message: Message) => {
    if (message.inputType === 'multiSelect' && message.options) {
      return (
        <div className="space-y-2">
          {message.options.map((option) => (
            <div key={option} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={option}
                checked={selectedDays.includes(option)}
                onCheckedChange={(checked) => {
                  handleDaySelection(option, checked as boolean);
                }}
              />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen p-4 flex flex-col">
      <ScrollArea className="flex-grow mb-4">
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