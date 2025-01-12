import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";

interface ChatStep {
  id: string;
  question: string;
  type: 'number' | 'time' | 'checkbox' | 'multi-time' | 'text';
  options?: { label: string; value: string }[];
  validation?: (value: any) => boolean;
  errorMessage?: string;
}

interface ScheduleChatProps {
  onStepComplete: (stepId: string, value: any) => void;
  onComplete: () => void;
}

export const ScheduleChat = ({ onStepComplete, onComplete }: ScheduleChatProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState<any>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const chatSteps: ChatStep[] = [
    {
      id: 'sleepHours',
      question: 'כמה שעות שינה אתה ישן בלילה? (מומלץ: 8-9 שעות)',
      type: 'number',
      validation: (value) => value >= 4 && value <= 12,
      errorMessage: 'אנא הזן מספר שעות בין 4 ל-12'
    },
    {
      id: 'screenTime',
      question: 'כמה זמן מסך יש לך ביום (פלאפון/סוני)? ציין את מספר השעות.',
      type: 'number',
      validation: (value) => value >= 0 && value <= 24,
      errorMessage: 'אנא הזן מספר שעות תקין'
    },
    {
      id: 'hasSchool',
      question: 'האם יש לך בית ספר השבוע?',
      type: 'checkbox'
    }
  ];

  const days = [
    { id: 0, label: "ראשון" },
    { id: 1, label: "שני" },
    { id: 2, label: "שלישי" },
    { id: 3, label: "רביעי" },
    { id: 4, label: "חמישי" },
    { id: 5, label: "שישי" },
  ];

  const handleNext = () => {
    const currentStep = chatSteps[currentStepIndex];
    
    if (currentStep.validation && !currentStep.validation(currentValue)) {
      toast.error(currentStep.errorMessage || 'ערך לא תקין');
      return;
    }

    onStepComplete(currentStep.id, currentValue);
    
    if (currentStepIndex < chatSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentValue(null);
      setSelectedDays([]);
    } else {
      onComplete();
    }
  };

  const renderInput = () => {
    const currentStep = chatSteps[currentStepIndex];

    switch (currentStep.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(Number(e.target.value))}
            className="w-24 text-right"
            dir="ltr"
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={currentValue || false}
              onCheckedChange={(checked) => setCurrentValue(checked)}
            />
            <span>כן</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <Label className="text-lg font-medium">
          {chatSteps[currentStepIndex].question}
        </Label>
        
        <div className="space-y-4">
          {renderInput()}
        </div>

        <Button onClick={handleNext} className="mt-4">
          המשך
        </Button>
      </div>
    </Card>
  );
};