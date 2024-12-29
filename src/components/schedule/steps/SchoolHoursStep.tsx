import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

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
    if (selectedDays.length === 0) {
      toast.error("יש לבחור לפחות יום אחד");
      return;
    }

    const activities = [];

    selectedDays.forEach((day) => {
      // Add wake up time 1.5 hours before school
      const wakeUpTime = new Date(`2000-01-01T${startTime}`);
      wakeUpTime.setHours(wakeUpTime.getHours() - 1);
      wakeUpTime.setMinutes(wakeUpTime.getMinutes() - 30);
      
      activities.push({
        day_of_week: day,
        start_time: wakeUpTime.toTimeString().slice(0, 5),
        end_time: wakeUpTime.toTimeString().slice(0, 5),
        activity_type: "wake_up",
        title: "השכמה",
        priority: 1
      });

      // Add departure time 30 minutes before school
      const departureTime = new Date(`2000-01-01T${startTime}`);
      departureTime.setMinutes(departureTime.getMinutes() - 30);
      
      activities.push({
        day_of_week: day,
        start_time: departureTime.toTimeString().slice(0, 5),
        end_time: departureTime.toTimeString().slice(0, 5),
        activity_type: "departure",
        title: "יציאה לבית ספר",
        priority: 2
      });

      // Add school hours
      activities.push({
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        activity_type: "school",
        title: "בית ספר",
        priority: 3
      });

      // Add lunch break in the middle of the school day
      const lunchTime = new Date(`2000-01-01T${startTime}`);
      const endTimeDate = new Date(`2000-01-01T${endTime}`);
      const middleTime = new Date((lunchTime.getTime() + endTimeDate.getTime()) / 2);
      
      activities.push({
        day_of_week: day,
        start_time: middleTime.toTimeString().slice(0, 5),
        end_time: new Date(middleTime.getTime() + 30 * 60000).toTimeString().slice(0, 5),
        activity_type: "lunch",
        title: "ארוחת צהריים",
        priority: 4
      });
    });

    // Add all activities at once
    activities.forEach(activity => {
      onAddActivity(activity);
    });

    toast.success(`נוספו שעות בית ספר ל-${selectedDays.length} ימים`);
    
    // Reset form
    setSelectedDays([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>ימי לימודים</Label>
        <div className="grid grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day.id} className="flex items-center space-x-2 space-x-reverse">
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