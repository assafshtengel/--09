import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { PreMatchExplanationDialog } from "./PreMatchExplanationDialog";

interface MatchDetails {
  date: string;
  time?: string | null;
  opponent?: string;
  location?: string;
  position?: string;
  match_type?: string;
}

interface MatchDetailsFormProps {
  onSubmit: (details: MatchDetails) => void;
  initialData: MatchDetails;
}

export const MatchDetailsForm = ({ onSubmit, initialData }: MatchDetailsFormProps) => {
  const [date, setDate] = useState(initialData.date);
  const [time, setTime] = useState(initialData.time || "");
  const [opponent, setOpponent] = useState(initialData.opponent || "");
  const [position, setPosition] = useState(initialData.position || "forward");
  const [matchType, setMatchType] = useState(initialData.match_type || "friendly");
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowExplanation(true);
  };

  const handleContinue = () => {
    onSubmit({ 
      date, 
      time: time.trim() || null,
      opponent,
      position,
      match_type: matchType
    });
  };

  return (
    <>
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
              className="text-right"
              placeholder="שם הקבוצה היריבה"
            />
          </div>

          <div>
            <label htmlFor="match_type" className="block text-right mb-2">סוג משחק</label>
            <select
              id="match_type"
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
              className="w-full p-2 border rounded text-right"
            >
              <option value="cup">גביע</option>
              <option value="league">ליגה</option>
              <option value="friendly">ידידות</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div>
            <label htmlFor="position" className="block text-right mb-2">עמדה</label>
            <select
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full p-2 border rounded text-right"
            >
              <option value="forward">חלוץ</option>
              <option value="midfielder">קשר</option>
              <option value="defender">מגן</option>
              <option value="goalkeeper">שוער</option>
              <option value="centerback">בלם</option>
              <option value="winger">כנף</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">המשך</Button>
        </div>
      </form>

      <PreMatchExplanationDialog
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        onContinue={handleContinue}
      />
    </>
  );
};