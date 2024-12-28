import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface MatchDetailsFormProps {
  onSubmit: (details: { date: string; time: string; opponent: string }) => void;
  initialData: { date: string; time: string; opponent: string };
}

export const MatchDetailsForm = ({ onSubmit, initialData }: MatchDetailsFormProps) => {
  const [date, setDate] = useState(initialData.date);
  const [time, setTime] = useState(initialData.time);
  const [opponent, setOpponent] = useState(initialData.opponent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ date, time, opponent });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-right mb-2">תאריך המשחק</label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="text-right"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-right mb-2">שעת המשחק</label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="text-right"
          />
        </div>

        <div>
          <label htmlFor="opponent" className="block text-right mb-2">קבוצה יריבה</label>
          <Input
            id="opponent"
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            required
            className="text-right"
            placeholder="שם הקבוצה היריבה"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">המשך</Button>
      </div>
    </form>
  );
};