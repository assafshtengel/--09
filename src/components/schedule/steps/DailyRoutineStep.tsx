import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface DailyRoutineStepProps {
  onAddActivity: (activity: any) => void;
}

export const DailyRoutineStep = ({ onAddActivity }: DailyRoutineStepProps) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [breakfastTime, setBreakfastTime] = useState("07:30");
  const [lunchTime, setLunchTime] = useState("13:00");
  const [dinnerTime, setDinnerTime] = useState("19:00");
  const [bedTime, setBedTime] = useState("22:00");

  const days = [
    { id: 0, label: "ראשון" },
    { id: 1, label: "שני" },
    { id: 2, label: "שלישי" },
    { id: 3, label: "רביעי" },
    { id: 4, label: "חמישי" },
    { id: 5, label: "שישי" },
    { id: 6, label: "שבת" },
  ];

  const formatTimeForDatabase = (timeString: string): string => {
    return timeString.split(':').slice(0, 2).join(':');
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleAddRoutine = () => {
    if (selectedDays.length === 0) {
      toast.error("יש לבחור לפחות יום אחד");
      return;
    }

    selectedDays.forEach((day) => {
      // Wake up
      onAddActivity({
        day_of_week: day,
        start_time: formatTimeForDatabase(wakeUpTime),
        end_time: formatTimeForDatabase(wakeUpTime),
        activity_type: "wake_up",
        title: "השכמה",
        priority: 1
      });

      // Sleep time
      onAddActivity({
        day_of_week: day,
        start_time: formatTimeForDatabase(bedTime),
        end_time: "23:59",
        activity_type: "wake_up",
        title: "זמן שינה",
        priority: 1
      });

      // Breakfast
      const breakfastEndTime = calculateEndTime(breakfastTime, 30);
      onAddActivity({
        day_of_week: day,
        start_time: formatTimeForDatabase(breakfastTime),
        end_time: formatTimeForDatabase(breakfastEndTime),
        activity_type: "lunch",
        title: "ארוחת בוקר",
        priority: 2
      });

      // Lunch
      const lunchEndTime = calculateEndTime(lunchTime, 45);
      onAddActivity({
        day_of_week: day,
        start_time: formatTimeForDatabase(lunchTime),
        end_time: formatTimeForDatabase(lunchEndTime),
        activity_type: "lunch",
        title: "ארוחת צהריים",
        priority: 3
      });

      // Dinner
      const dinnerEndTime = calculateEndTime(dinnerTime, 45);
      onAddActivity({
        day_of_week: day,
        start_time: formatTimeForDatabase(dinnerTime),
        end_time: formatTimeForDatabase(dinnerEndTime),
        activity_type: "lunch",
        title: "ארוחת ערב",
        priority: 4
      });

      // Free time blocks
      const freeTimeBlocks = [
        { start: "16:00", end: "18:00", title: "זמן חופשי" },
        { start: dinnerEndTime, end: bedTime, title: "זמן חופשי לפני השינה" }
      ];

      freeTimeBlocks.forEach((block, index) => {
        onAddActivity({
          day_of_week: day,
          start_time: formatTimeForDatabase(block.start),
          end_time: formatTimeForDatabase(block.end),
          activity_type: "free_time",
          title: block.title,
          priority: 5 + index
        });
      });
    });

    toast.success(`נוספה שגרה יומית ל-${selectedDays.length} ימים`);
    setSelectedDays([]);
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>שעת השכמה</Label>
          <Input
            type="time"
            value={wakeUpTime}
            onChange={(e) => setWakeUpTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>שעת ארוחת בוקר</Label>
          <Input
            type="time"
            value={breakfastTime}
            onChange={(e) => setBreakfastTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>שעת ארוחת צהריים</Label>
          <Input
            type="time"
            value={lunchTime}
            onChange={(e) => setLunchTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>שעת ארוחת ערב</Label>
          <Input
            type="time"
            value={dinnerTime}
            onChange={(e) => setDinnerTime(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>שעת שינה</Label>
          <Input
            type="time"
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleAddRoutine} className="w-full">
        הוסף שגרה יומית
      </Button>
    </div>
  );
};