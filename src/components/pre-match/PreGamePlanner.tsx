import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const PreGamePlanner = () => {
  const [matchTime, setMatchTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [commitments, setCommitments] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Call the edge function to generate schedule
      const { data, error } = await supabase.functions.invoke('generate-pre-game-schedule', {
        body: {
          matchTime,
          departureTime,
          commitments,
          userId: user.id
        }
      });

      if (error) throw error;

      toast.success("הלו״ז נוצר בהצלחה!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("שגיאה ביצירת הלו״ז");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="p-6 space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-center mb-8">
          תכנון 24 שעות לפני המשחק
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="matchTime" className="block text-right mb-2">
                מתי שעת המשחק?
              </label>
              <Input
                id="matchTime"
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                required
                className="text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label htmlFor="departureTime" className="block text-right mb-2">
                מתי יוצאים מהבית?
              </label>
              <Input
                id="departureTime"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
                className="text-right"
                dir="rtl"
              />
            </div>

            <div>
              <label htmlFor="commitments" className="block text-right mb-2">
                האם יש בית ספר או מחויבויות נוספות?
              </label>
              <Textarea
                id="commitments"
                value={commitments}
                onChange={(e) => setCommitments(e.target.value)}
                placeholder="פרט את המחויבויות שלך (אופציונלי)"
                className="text-right min-h-[100px]"
                dir="rtl"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "...יוצר לו״ז" : "תן לי סדר יום"}
          </Button>
        </form>
      </Card>
    </div>
  );
};