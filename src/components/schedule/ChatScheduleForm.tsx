import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Message {
  type: 'system' | 'user';
  content: string;
  options?: string[];
  inputType?: 'multiSelect' | 'timeInputs' | 'teamTraining' | 'personalTraining' | 'sleepSchedule' | 'screenTime' | 'specialEvents' | 'games' | 'notes';
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
    schoolHours: {},
    teamTraining: [],
    personalTraining: [],
    sleepSchedule: {},
    screenTime: {},
    specialEvents: [],
    games: [],
    notes: '',
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [tempInput, setTempInput] = useState<any>({
    trainingDay: '',
    startTime: '',
    endTime: '',
    description: ''
  });

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

  const handleTimeInput = (day: string, type: 'start' | 'end', value: string) => {
    const updatedHours = { ...schedule.schoolHours };
    if (!updatedHours[day]) {
      updatedHours[day] = {};
    }
    updatedHours[day][type] = value;
    
    const updatedSchedule = { ...schedule, schoolHours: updatedHours };
    setSchedule(updatedSchedule);
    onScheduleChange(updatedSchedule);
  };

  const handleTeamTrainingInput = () => {
    if (!tempInput.trainingDay || !tempInput.startTime || !tempInput.endTime) {
      toast.error("נא למלא את כל פרטי האימון");
      return;
    }

    const newTraining = {
      day: tempInput.trainingDay,
      startTime: tempInput.startTime,
      endTime: tempInput.endTime,
      description: tempInput.description || "אימון קבוצה"
    };

    const updatedSchedule = {
      ...schedule,
      teamTraining: [...schedule.teamTraining, newTraining]
    };

    setSchedule(updatedSchedule);
    onScheduleChange(updatedSchedule);
    setTempInput({ trainingDay: '', startTime: '', endTime: '', description: '' });

    // Add confirmation message
    setMessages(prev => [...prev, {
      type: 'system',
      content: `נוסף אימון קבוצה ביום ${newTraining.day} בין השעות ${newTraining.startTime}-${newTraining.endTime}`,
    }]);
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'באילו ימים יש לך בית ספר השבוע?',
        inputType: 'multiSelect',
        options: days,
      }]);
    } else if (currentStep === 1 && selectedDays.length > 0) {
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'מה שעות ההתחלה והסיום לכל יום שבחרת?',
        inputType: 'timeInputs',
      }]);
    } else if (currentStep === 2) {
      setMessages(prev => [...prev, {
        type: 'system',
        content: 'מתי יש לך אימוני קבוצה השבוע? ציין את הימים והשעות.',
        inputType: 'teamTraining',
      }]);
    }
    setCurrentStep(prev => prev + 1);
  };

  const renderInput = (message: Message) => {
    if (message.inputType === 'multiSelect' && message.options) {
      return (
        <div className="space-y-3 mt-4">
          {message.options.map((option) => (
            <div 
              key={option} 
              className={`
                flex items-center space-x-2 space-x-reverse 
                ${option === 'אין לימודים השבוע' ? 'mt-4 border-t pt-4' : ''}
                bg-white rounded-xl p-4 shadow-sm 
                hover:bg-blue-50 hover:shadow-md
                transition-all duration-200 ease-in-out
                border border-gray-100
              `}
            >
              <Checkbox
                id={option}
                checked={selectedDays.includes(option)}
                onCheckedChange={(checked) => {
                  handleDaySelection(option, checked as boolean);
                }}
                className="border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <Label 
                htmlFor={option} 
                className="text-base font-medium cursor-pointer flex-grow text-gray-900 select-none"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    if (message.inputType === 'timeInputs') {
      return (
        <div className="space-y-4 mt-4">
          {selectedDays.filter(day => day !== 'אין לימודים השבוע').map((day) => (
            <div key={day} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <Label className="text-lg font-medium text-gray-900 mb-3 block">{day}</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor={`${day}-start`} 
                    className="text-sm text-gray-700 block"
                  >
                    שעת התחלה
                  </Label>
                  <Input
                    id={`${day}-start`}
                    type="time"
                    value={schedule.schoolHours[day]?.start || ''}
                    onChange={(e) => handleTimeInput(day, 'start', e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label 
                    htmlFor={`${day}-end`} 
                    className="text-sm text-gray-700 block"
                  >
                    שעת סיום
                  </Label>
                  <Input
                    id={`${day}-end`}
                    type="time"
                    value={schedule.schoolHours[day]?.end || ''}
                    onChange={(e) => handleTimeInput(day, 'end', e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (message.inputType === 'teamTraining') {
      return (
        <div className="space-y-4 mt-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 block">יום</Label>
              <select
                value={tempInput.trainingDay}
                onChange={(e) => setTempInput({ ...tempInput, trainingDay: e.target.value })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 bg-white focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">בחר יום</option>
                {days.filter(day => day !== 'אין לימודים השבוע').map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 block">שעת התחלה</Label>
                <Input
                  type="time"
                  value={tempInput.startTime}
                  onChange={(e) => setTempInput({ ...tempInput, startTime: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-700 block">שעת סיום</Label>
                <Input
                  type="time"
                  value={tempInput.endTime}
                  onChange={(e) => setTempInput({ ...tempInput, endTime: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 block">תיאור האימון (אופציונלי)</Label>
              <Input
                type="text"
                value={tempInput.description}
                onChange={(e) => setTempInput({ ...tempInput, description: e.target.value })}
                placeholder="למשל: אימון טכני, אימון כושר..."
                className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleTeamTrainingInput}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              הוסף אימון
            </Button>
          </div>
          
          {schedule.teamTraining.length > 0 && (
            <div className="mt-6 space-y-3">
              <Label className="text-base font-medium text-gray-900 block">אימונים שנקבעו:</Label>
              {schedule.teamTraining.map((training: any, index: number) => (
                <div key={index} className="bg-blue-50 rounded-lg p-3 text-sm text-gray-700">
                  {training.day} | {training.startTime}-{training.endTime}
                  {training.description && ` | ${training.description}`}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] bg-gray-50">
      <ScrollArea className="flex-grow px-4">
        <div className="space-y-6 py-6 max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'system' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`rounded-2xl p-5 max-w-[85%] ${
                  message.type === 'system'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <p className={`text-base leading-relaxed ${
                  message.type === 'system' ? 'text-white' : 'text-gray-900'
                }`}>
                  {message.content}
                </p>
                {message.inputType && renderInput(message)}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {currentStep === 0 && (
        <div className="p-4 border-t bg-white shadow-lg">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl h-14 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleNextStep}
          >
            בוא נתחיל
          </Button>
        </div>
      )}

      {currentStep === 1 && selectedDays.length > 0 && (
        <div className="p-4 border-t bg-white shadow-lg">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl h-14 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleNextStep}
          >
            המשך להזנת שעות
          </Button>
        </div>
      )}

      {currentStep === 2 && Object.keys(schedule.schoolHours).length > 0 && (
        <div className="p-4 border-t bg-white shadow-lg">
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-xl h-14 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleNextStep}
          >
            המשך לאימוני קבוצה
          </Button>
        </div>
      )}
    </div>
  );
};
