import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const PreGamePlanner = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [matchTime, setMatchTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [commitments, setCommitments] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      console.log("Submitting pre-game planner form with:", {
        matchTime,
        departureTime,
        commitments,
        userId: user.id
      });

      // Call the edge function to generate schedule
      const { data, error } = await supabase.functions.invoke('generate-pre-game-schedule', {
        body: JSON.stringify({
          matchTime,
          departureTime,
          commitments,
          userId: user.id
        })
      });

      if (error) throw error;

      console.log("Received schedule data:", data);

      if (data?.activities) {
        // Process activities
        const processedActivities = data.activities.map((activity: any) => ({
          id: activity.id || undefined,
          day_of_week: activity.day_of_week,
          start_time: activity.start_time,
          end_time: activity.end_time,
          activity_type: activity.activity_type,
          title: activity.title || undefined
        }));

        // Save activities to the database
        const { error: saveError } = await supabase
          .from('schedule_activities')
          .insert(processedActivities);

        if (saveError) throw saveError;

        toast({
          title: "תוכנית נשמרה בהצלחה",
          description: "התוכנית שלך נוצרה ונשמרה",
        });

        // Navigate to weekly planner to view the schedule
        navigate('/weekly-planner');
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור את התוכנית כרגע",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-right">תכנון לפני משחק</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="matchTime" className="text-right block">שעת המשחק</Label>
          <Input
            id="matchTime"
            type="time"
            value={matchTime}
            onChange={(e) => setMatchTime(e.target.value)}
            required
            className="text-right"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="departureTime" className="text-right block">שעת יציאה</Label>
          <Input
            id="departureTime"
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            required
            className="text-right"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commitments" className="text-right block">התחייבויות אחרות (אופציונלי)</Label>
          <Textarea
            id="commitments"
            value={commitments}
            onChange={(e) => setCommitments(e.target.value)}
            className="text-right"
            placeholder="למשל: מבחן בשעה 10:00, אימון בשעה 16:00"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              יוצר תוכנית...
            </>
          ) : (
            'צור תוכנית'
          )}
        </Button>
      </form>
    </div>
  );
};

export default PreGamePlanner;