import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SchoolHoursInputProps {
  date: string;
  onSubmit: (hours: { start: string; end: string }) => void;
}

export const SchoolHoursInput = ({ date, onSubmit }: SchoolHoursInputProps) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime && endTime) {
      onSubmit({ start: startTime, end: endTime });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>שעת התחלה</Label>
        <Input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>שעת סיום</Label>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        המשך
      </Button>
    </form>
  );
};