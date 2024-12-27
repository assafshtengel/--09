import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SchoolHoursStepProps {
  onAddActivity: (activity: any) => void;
}

export const SchoolHoursStep = ({ onAddActivity }: SchoolHoursStepProps) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("15:00");

  const days = [
    { id: 0, label: "ראשון" },
    { id: 1, label: "שני" },
    { id: 2, label: "שלישי" },
    { id: 3, label: "רביעי" },
    { id: 4, label: "חמישי" },
    { id: 5, label: "שישי" },
  ];

  const handleAddSchoolHours = () => {
    selectedDays.forEach((day) => {
      onAddActivity({
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        activity_type: "school",
        title: "בית ספר",
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>ימי לימודים</Label>
        <div className="grid grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day.id} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day.id}`}
                checked={selectedDays.includes(day.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedDays([...selectedDays, day.id]);
                  } else {
                    setSelectedDays(selectedDays.filter((d) => d !== day.id));
                  }
                }}
              />
              <Label htmlFor={`day-${day.id}`}>{day.label}</Label>
            </div>
          ))}
        </div>
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

      <Button onClick={handleAddSchoolHours} className="w-full">
        הוסף שעות בית ספר
      </Button>
    </div>
  );
};