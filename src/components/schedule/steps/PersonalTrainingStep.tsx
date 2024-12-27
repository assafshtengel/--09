import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalTrainingStepProps {
  onAddActivity: (activity: any) => void;
}

export const PersonalTrainingStep = ({ onAddActivity }: PersonalTrainingStepProps) => {
  const [day, setDay] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<string>("");

  const days = [
    { value: "0", label: "ראשון" },
    { value: "1", label: "שני" },
    { value: "2", label: "שלישי" },
    { value: "3", label: "רביעי" },
    { value: "4", label: "חמישי" },
    { value: "5", label: "שישי" },
    { value: "6", label: "שבת" },
  ];

  const trainingTypes = [
    { value: "personal_training", label: "אימון אישי" },
    { value: "mental_training", label: "אימון מנטלי" },
    { value: "other", label: "אחר" },
  ];

  const handleAddTraining = () => {
    if (day && startTime && endTime && type) {
      onAddActivity({
        day_of_week: parseInt(day),
        start_time: startTime,
        end_time: endTime,
        activity_type: type,
        title: trainingTypes.find(t => t.value === type)?.label,
      });
      
      // Reset form
      setDay("");
      setStartTime("");
      setEndTime("");
      setType("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>יום</Label>
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger>
              <SelectValue placeholder="בחר יום" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>סוג אימון</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="בחר סוג אימון" />
            </SelectTrigger>
            <SelectContent>
              {trainingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>שעת התחלה</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>שעת סיום</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleAddTraining} className="w-full">
        הוסף אימון
      </Button>
    </div>
  );
};