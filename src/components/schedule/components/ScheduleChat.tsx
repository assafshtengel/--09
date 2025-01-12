import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, School, Users, Trophy, Book, PersonStanding, PartyPopper, ArrowLeft } from "lucide-react";

interface ChatStep {
  id: string;
  question: string;
  type: 'number' | 'time' | 'radio' | 'multi-time' | 'text' | 'days-selection' | 'multi-input';
  icon: React.ReactNode;
  validation?: (value: any) => boolean;
  errorMessage?: string;
  additionalFields?: {
    type: string;
    label: string;
    key: string;
  }[];
}

interface ScheduleChatProps {
  onStepComplete: (stepId: string, value: any) => void;
  onComplete: () => void;
}

export const ScheduleChat = ({ onStepComplete, onComplete }: ScheduleChatProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState<any>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [multiInputs, setMultiInputs] = useState<any[]>([]);
  const [schoolDays, setSchoolDays] = useState<{[key: number]: {startTime: string; endTime: string}}>({});

  const chatSteps: ChatStep[] = [
    {
      id: 'sleepHours',
      question: 'כמה שעות שינה אתה ישן בלילה? (מומלץ: 8-9 שעות)',
      type: 'number',
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      validation: (value) => value >= 4 && value <= 12,
      errorMessage: 'אנא הזן מספר שעות בין 4 ל-12'
    },
    {
      id: 'screenTime',
      question: 'כמה זמן מסך יש לך ביום (פלאפון/סוני)? ציין את מספר השעות.',
      type: 'number',
      icon: <Clock className="h-6 w-6 text-purple-500" />,
      validation: (value) => value >= 0 && value <= 24,
      errorMessage: 'אנא הזן מספר שעות תקין'
    },
    {
      id: 'hasSchool',
      question: 'האם יש לך בית ספר השבוע?',
      type: 'radio',
      icon: <School className="h-6 w-6 text-green-500" />
    },
    {
      id: 'teamTraining',
      question: 'מתי יש לך אימוני קבוצה השבוע?',
      type: 'multi-input',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      additionalFields: [
        { type: 'select', label: 'יום', key: 'day' },
        { type: 'time', label: 'שעת התחלה', key: 'startTime' },
        { type: 'time', label: 'שעת סיום', key: 'endTime' }
      ]
    },
    {
      id: 'teamGames',
      question: 'האם יש משחק לקבוצה השבוע?',
      type: 'multi-input',
      icon: <Trophy className="h-6 w-6 text-yellow-500" />,
      additionalFields: [
        { type: 'select', label: 'יום', key: 'day' },
        { type: 'time', label: 'שעה', key: 'time' },
        { type: 'text', label: 'יריבה', key: 'opponent' }
      ]
    },
    {
      id: 'exams',
      question: 'האם יש לך מבחנים בבית הספר השבוע?',
      type: 'multi-input',
      icon: <Book className="h-6 w-6 text-red-500" />,
      additionalFields: [
        { type: 'text', label: 'נושא', key: 'subject' },
        { type: 'select', label: 'יום', key: 'day' }
      ]
    },
    {
      id: 'personalTraining',
      question: 'האם יש לך אימונים אישיים השבוע?',
      type: 'multi-input',
      icon: <PersonStanding className="h-6 w-6 text-indigo-500" />,
      additionalFields: [
        { type: 'select', label: 'יום', key: 'day' },
        { type: 'time', label: 'שעת התחלה', key: 'startTime' },
        { type: 'time', label: 'שעת סיום', key: 'endTime' }
      ]
    },
    {
      id: 'socialEvents',
      question: 'האם יש לך אירועים חברתיים השבוע?',
      type: 'multi-input',
      icon: <PartyPopper className="h-6 w-6 text-pink-500" />,
      additionalFields: [
        { type: 'select', label: 'יום', key: 'day' },
        { type: 'time', label: 'שעה', key: 'time' },
        { type: 'text', label: 'תיאור', key: 'description' }
      ]
    }
  ];

  const days = [
    { id: 0, label: "ראשון" },
    { id: 1, label: "שני" },
    { id: 2, label: "שלישי" },
    { id: 3, label: "רביעי" },
    { id: 4, label: "חמישי" },
    { id: 5, label: "שישי" },
    { id: 6, label: "שבת" },
  ];

  const handleNext = () => {
    const currentStep = chatSteps[currentStepIndex];
    
    if (currentStep.validation && !currentStep.validation(currentValue)) {
      toast.error(currentStep.errorMessage || 'ערך לא תקין');
      return;
    }

    if (currentStep.id === 'hasSchool' && currentValue === 'yes' && Object.keys(schoolDays).length === 0) {
      toast.error('אנא בחר לפחות יום אחד ושעות לימודים');
      return;
    }

    let valueToSave = currentValue;
    if (currentStep.id === 'hasSchool') {
      valueToSave = {
        hasSchool: currentValue === 'yes',
        schoolDays: currentValue === 'yes' ? schoolDays : undefined
      };
    }

    onStepComplete(currentStep.id, valueToSave);
    
    if (currentStepIndex < chatSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setCurrentValue(null);
      setSelectedDays([]);
      setMultiInputs([]);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentValue(null);
      setSelectedDays([]);
      setMultiInputs([]);
    }
  };

  const handleSchoolDayChange = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setSchoolDays(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));
  };

  const handleMultiInputChange = (index: number, field: string, value: string) => {
    setMultiInputs(prev => {
      const newInputs = [...prev];
      if (!newInputs[index]) {
        newInputs[index] = {};
      }
      newInputs[index][field] = value;
      return newInputs;
    });
    setCurrentValue(multiInputs);
  };

  const handleAddMultiInput = () => {
    setMultiInputs(prev => [...prev, {}]);
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
      
      case 'radio':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={currentValue}
              onValueChange={setCurrentValue}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">כן</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">לא</Label>
              </div>
            </RadioGroup>

            {currentValue === 'yes' && (
              <div className="mt-4 space-y-4">
                {days.slice(0, 6).map((day) => (
                  <div key={day.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <Label>{day.label}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>שעת התחלה</Label>
                        <Input
                          type="time"
                          value={schoolDays[day.id]?.startTime || ''}
                          onChange={(e) => handleSchoolDayChange(day.id, 'startTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>שעת סיום</Label>
                        <Input
                          type="time"
                          value={schoolDays[day.id]?.endTime || ''}
                          onChange={(e) => handleSchoolDayChange(day.id, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'multi-input':
        return (
          <div className="space-y-4">
            {multiInputs.map((input, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                {currentStep.additionalFields?.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    {field.type === 'select' ? (
                      <select
                        className="w-full p-2 border rounded"
                        value={input[field.key] || ''}
                        onChange={(e) => handleMultiInputChange(index, field.key, e.target.value)}
                      >
                        <option value="">בחר יום</option>
                        {days.map((day) => (
                          <option key={day.id} value={day.id}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type={field.type}
                        value={input[field.key] || ''}
                        onChange={(e) => handleMultiInputChange(index, field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMultiInput}
              className="w-full"
            >
              הוסף {currentStep.id === 'teamTraining' ? 'אימון' : 'פריט'} נוסף
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4 mb-6">
            {chatSteps[currentStepIndex].icon}
            <Label className="text-xl font-medium">
              {chatSteps[currentStepIndex].question}
            </Label>
          </div>
          
          <div className="space-y-4">
            {renderInput()}
          </div>

          <div className="flex justify-between pt-4">
            <Button 
              onClick={handleBack}
              variant="outline"
              className="min-w-[120px]"
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              חזור
            </Button>

            <Button 
              onClick={handleNext}
              className={cn(
                "min-w-[120px]",
                currentStepIndex === chatSteps.length - 1 ? "bg-green-500 hover:bg-green-600" : ""
              )}
            >
              {currentStepIndex === chatSteps.length - 1 ? "סיים" : "המשך"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};
