import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface WeeklyScheduleFormProps {
  onScheduleChange: (schedule: any) => void;
}

export const WeeklyScheduleForm = ({ onScheduleChange }: WeeklyScheduleFormProps) => {
  const [selectedDay, setSelectedDay] = useState<string>("Sunday");
  const [schedule, setSchedule] = useState<any>({
    sleep: {},
    phoneTime: {},
    teamPractices: [],
    personalTraining: [],
    games: [],
    notes: "",
  });

  const handleInputChange = (field: string, value: any) => {
    const newSchedule = { ...schedule, [field]: value };
    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Select Day</Label>
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger>
            <SelectValue placeholder="Select a day" />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Sleep Schedule</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Sleep Time</Label>
            <Input
              type="time"
              value={schedule.sleep[selectedDay]?.start || ""}
              onChange={(e) =>
                handleInputChange("sleep", {
                  ...schedule.sleep,
                  [selectedDay]: { ...schedule.sleep[selectedDay], start: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Wake Time</Label>
            <Input
              type="time"
              value={schedule.sleep[selectedDay]?.end || ""}
              onChange={(e) =>
                handleInputChange("sleep", {
                  ...schedule.sleep,
                  [selectedDay]: { ...schedule.sleep[selectedDay], end: e.target.value },
                })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Phone Time</h3>
        <div>
          <Label>Hours on Phone</Label>
          <Input
            type="number"
            min="0"
            max="24"
            value={schedule.phoneTime[selectedDay] || ""}
            onChange={(e) =>
              handleInputChange("phoneTime", {
                ...schedule.phoneTime,
                [selectedDay]: e.target.value,
              })
            }
          />
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Activities</h3>
        <div className="space-y-4">
          <div>
            <Label>Team Practice Time</Label>
            <Input
              type="time"
              value={schedule.teamPractices.find((p: any) => p.day === selectedDay)?.time || ""}
              onChange={(e) => {
                const practices = [...schedule.teamPractices];
                const index = practices.findIndex((p: any) => p.day === selectedDay);
                if (index >= 0) {
                  practices[index].time = e.target.value;
                } else {
                  practices.push({ day: selectedDay, time: e.target.value });
                }
                handleInputChange("teamPractices", practices);
              }}
            />
          </div>

          <div>
            <Label>Personal Training Time</Label>
            <Input
              type="time"
              value={schedule.personalTraining.find((p: any) => p.day === selectedDay)?.time || ""}
              onChange={(e) => {
                const training = [...schedule.personalTraining];
                const index = training.findIndex((p: any) => p.day === selectedDay);
                if (index >= 0) {
                  training[index].time = e.target.value;
                } else {
                  training.push({ day: selectedDay, time: e.target.value });
                }
                handleInputChange("personalTraining", training);
              }}
            />
          </div>

          <div>
            <Label>Game Time</Label>
            <Input
              type="time"
              value={schedule.games.find((g: any) => g.day === selectedDay)?.time || ""}
              onChange={(e) => {
                const games = [...schedule.games];
                const index = games.findIndex((g: any) => g.day === selectedDay);
                if (index >= 0) {
                  games[index].time = e.target.value;
                } else {
                  games.push({ day: selectedDay, time: e.target.value });
                }
                handleInputChange("games", games);
              }}
            />
          </div>
        </div>
      </Card>

      <div>
        <Label>Additional Notes</Label>
        <Textarea
          value={schedule.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Add any additional notes or activities..."
          className="h-32"
        />
      </div>
    </div>
  );
};