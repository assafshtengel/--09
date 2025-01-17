import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface TrainingHoursInputProps {
  dates: string[];
  onSubmit: (trainingDays: { [key: string]: { start: string; end: string } }) => void;
}

export const TrainingHoursInput = ({ dates, onSubmit }: TrainingHoursInputProps) => {
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({});
  const [hours, setHours] = useState<{ [key: string]: { start: string; end: string } }>({});

  const handleDaySelect = (date: string, checked: boolean) => {
    setSelectedDays((prev) => ({ ...prev, [date]: checked }));
    if (!checked) {
      const newHours = { ...hours };
      delete newHours[date];
      setHours(newHours);
    }
  };

  const handleTimeChange = (date: string, type: 'start' | 'end', value: string) => {
    setHours((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [type]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trainingHours = Object.entries(selectedDays)
      .filter(([_, selected]) => selected)
      .reduce((acc, [date]) => {
        if (hours[date]?.start && hours[date]?.end) {
          acc[date] = hours[date];
        }
        return acc;
      }, {} as { [key: string]: { start: string; end: string } });

    onSubmit(trainingHours);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {dates.map((date) => (
          <div key={date} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`day-${date}`}
                checked={selectedDays[date]}
                onCheckedChange={(checked) => handleDaySelect(date, checked as boolean)}
              />
              <Label htmlFor={`day-${date}`}>{date}</Label>
            </div>
            {selectedDays[date] && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label>שעת התחלה</Label>
                  <Input
                    type="time"
                    value={hours[date]?.start || ""}
                    onChange={(e) => handleTimeChange(date, 'start', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>שעת סיום</Label>
                  <Input
                    type="time"
                    value={hours[date]?.end || ""}
                    onChange={(e) => handleTimeChange(date, 'end', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full">
        המשך
      </Button>
    </form>
  );
};