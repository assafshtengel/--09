import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SchoolHoursInputProps {
  date: string;
  onSubmit: (hours: { start: string; end: string } | null) => void;
}

export const SchoolHoursInput = ({ date, onSubmit }: SchoolHoursInputProps) => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [noSchool, setNoSchool] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (noSchool) {
      onSubmit(null);
    } else if (startTime && endTime) {
      onSubmit({ start: startTime, end: endTime });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="noSchool"
          checked={noSchool}
          onCheckedChange={(checked) => {
            setNoSchool(checked as boolean);
            if (checked) {
              setStartTime("");
              setEndTime("");
            }
          }}
        />
        <Label htmlFor="noSchool" className="text-sm">
          אין בית ספר ביום זה
        </Label>
      </div>

      {!noSchool && (
        <>
          <div className="space-y-2">
            <Label>שעת התחלה</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required={!noSchool}
            />
          </div>
          <div className="space-y-2">
            <Label>שעת סיום</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required={!noSchool}
            />
          </div>
        </>
      )}
      
      <Button type="submit" className="w-full">
        המשך
      </Button>
    </form>
  );
};