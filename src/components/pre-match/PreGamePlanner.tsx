import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const PreGamePlanner = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [gameTime, setGameTime] = useState("");
  const [commitments, setCommitments] = useState("");
  const [schedule, setSchedule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSchedule = async () => {
    if (!currentTime || !gameTime) {
      toast.error("נא למלא את השעה הנוכחית ושעת המשחק");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pre-game-schedule', {
        body: {
          currentTime,
          gameTime,
          commitments: commitments || "אין מחויבויות נוספות"
        }
      });

      if (error) throw error;
      setSchedule(data.schedule);
      toast.success("סדר היום נוצר בהצלחה!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("שגיאה ביצירת סדר היום");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-right">תכנון 24 שעות לפני משחק</h1>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="currentTime">מה השעה כעת?</Label>
          <Input
            id="currentTime"
            type="time"
            value={currentTime}
            onChange={(e) => setCurrentTime(e.target.value)}
            className="text-right"
            dir="ltr"
          />
        </div>

        <div>
          <Label htmlFor="gameTime">מתי שעת המשחק?</Label>
          <Input
            id="gameTime"
            type="time"
            value={gameTime}
            onChange={(e) => setGameTime(e.target.value)}
            className="text-right"
            dir="ltr"
          />
        </div>

        <div>
          <Label htmlFor="commitments">האם יש בית ספר או מחויבויות נוספות?</Label>
          <Textarea
            id="commitments"
            value={commitments}
            onChange={(e) => setCommitments(e.target.value)}
            placeholder="פרט את המחויבויות שלך (אופציונלי)"
            className="text-right"
          />
        </div>

        <Button 
          onClick={generateSchedule} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "מייצר סדר יום..." : "תן לי סדר יום"}
        </Button>

        {schedule && (
          <Card className="p-4 mt-4">
            <pre className="whitespace-pre-wrap text-right" dir="rtl">
              {schedule}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
};