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
    'ראשון',
    'שני',
    'שלישי',
    'רביעי',
    'חמישי',
    'שישי',
    'אין לימודים השבוע',
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

  const handleContinueToHours = () => {
    if (selectedDays.length === 0) {
      return;
    }
    
    setMessages(prev => [...prev, {
      type: 'system',
      content: 'מעולה! עכשיו בוא נזין את השעות עבור כל יום.',
    }]);
    setCurrentStep(prev => prev + 2);
  };

  const renderInput = (message: Message) => {
    if (message.inputType === 'multiSelect' && message.options) {
      return (
        <div className="space-y-2 mt-4">
          {message.options.map((option) => (
            <div 
              key={option} 
              className="flex items-center space-x-2 space-x-reverse bg-white rounded-lg p-3 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                id={option}
                checked={selectedDays.includes(option)}
                onCheckedChange={(checked) => {
                  handleDaySelection(option, checked as boolean);
                }}
              />
              <Label htmlFor={option} className="text-sm font-medium cursor-pointer flex-grow text-gray-900">
                {option}
              </Label>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-gray-50">
      <ScrollArea className="flex-grow px-4">
        <div className="space-y-4 py-4 max-w-xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'system' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`rounded-2xl p-4 max-w-[80%] ${
                  message.type === 'system'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.inputType && renderInput(message)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {currentStep === 0 && (
        <div className="p-4 border-t bg-white">
          <Button
            className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-xl h-12"
            onClick={handleNextQuestion}
          >
            בוא נתחיל
          </Button>
        </div>
      )}

      {currentStep === 1 && selectedDays.length > 0 && (
        <div className="p-4 border-t bg-white">
          <Button
            className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-xl h-12"
            onClick={handleContinueToHours}
          >
            המשך להזנת שעות
          </Button>
        </div>
      )}
    </div>
  );
};