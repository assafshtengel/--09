import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DailyRoutineStepProps {
  onAddActivity: (activity: any) => void;
}

export const DailyRoutineStep = ({ onAddActivity }: DailyRoutineStepProps) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [wakeUpTime, setWakeUpTime] = useState("07:00");

  const days = [
    { id: 0, label: "ראשון" },
    { id: 1, label: "שני" },
    { id: 2, label: "שלישי" },
    { id: 3, label: "רביעי" },
    { id: 4, label: "חמישי" },
    { id: 5, label: "שישי" },
    { id: 6, label: "שבת" },
  ];

  const handleAddWakeUpTime = () => {
    selectedDays.forEach((day) => {
      onAddActivity({
        day_of_week: day,
        start_time: wakeUpTime,
        end_time: wakeUpTime,
        activity_type: "wake_up",
        title: "השכמה",
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>ימים</Label>
        <div className="grid grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day.id} className="flex items-center space-x-2">
              <Checkbox
                id={`routine-day-${day.id}`}
                checked={selectedDays.includes(day.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedDays([...selectedDays, day.id]);
                  } else {
                    setSelectedDays(selectedDays.filter((d) => d !== day.id));
                  }
                }}
              />
              <Label htmlFor={`routine-day-${day.id}`}>{day.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>שעת השכמה</Label>
        <Input
          type="time"
          value={wakeUpTime}
          onChange={(e) => setWakeUpTime(e.target.value)}
        />
      </div>

      <Button onClick={handleAddWakeUpTime} className="w-full">
        הוסף שעת השכמה
      </Button>
    </div>
  );
};