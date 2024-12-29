import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamTrainingStepProps {
  onAddActivity: (activity: any) => void;
}

export const TeamTrainingStep = ({ onAddActivity }: TeamTrainingStepProps) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("19:00");
  const [activityType, setActivityType] = useState<"team_training" | "team_game">("team_training");

  const days = [
    { id: 0, label: "ראשון" },
    { id: 1, label: "שני" },
    { id: 2, label: "שלישי" },
    { id: 3, label: "רביעי" },
    { id: 4, label: "חמישי" },
    { id: 5, label: "שישי" },
    { id: 6, label: "שבת" },
  ];

  const handleAddTeamActivity = () => {
    selectedDays.forEach((day) => {
      onAddActivity({
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
        activity_type: activityType,
        title: activityType === "team_training" ? "אימון קבוצה" : "משחק קבוצה",
      });

      // Add lunch reminder 1:40 hours before activity
      const lunchTime = new Date(`2000-01-01T${startTime}`);
      lunchTime.setHours(lunchTime.getHours() - 1);
      lunchTime.setMinutes(lunchTime.getMinutes() - 40);
      
      onAddActivity({
        day_of_week: day,
        start_time: lunchTime.toTimeString().slice(0, 5),
        end_time: lunchTime.toTimeString().slice(0, 5),
        activity_type: "lunch",
        title: "תזכורת ארוחת צהריים",
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>סוג פעילות</Label>
        <Select value={activityType} onValueChange={(value: "team_training" | "team_game") => setActivityType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="בחר סוג פעילות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="team_training">אימון קבוצה</SelectItem>
            <SelectItem value="team_game">משחק קבוצה</SelectItem>
          </SelectContent>
        </Select>

        <Label>ימי פעילות</Label>
        <div className="grid grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day.id} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`training-day-${day.id}`}
                checked={selectedDays.includes(day.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedDays([...selectedDays, day.id]);
                  } else {
                    setSelectedDays(selectedDays.filter((d) => d !== day.id));
                  }
                }}
              />
              <Label htmlFor={`training-day-${day.id}`}>{day.label}</Label>
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

      <Button onClick={handleAddTeamActivity} className="w-full">
        {activityType === "team_training" ? "הוסף אימוני קבוצה" : "הוסף משחקי קבוצה"}
      </Button>
    </div>
  );
};