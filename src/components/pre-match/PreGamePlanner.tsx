import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Share2, Edit, Save } from "lucide-react";
import { format, formatDistanceToNow, addDays } from "date-fns";
import { he } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScheduleItem {
  time: string;
  activity: string;
}

export const PreGamePlanner = () => {
  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [currentTime, setCurrentTime] = useState(format(new Date(), "HH:mm"));
  const [gameDate, setGameDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [gameTime, setGameTime] = useState("");
  const [commitments, setCommitments] = useState("");
  const [schedule, setSchedule] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const calculateTimeRemaining = () => {
    if (!gameDate || !gameTime) return null;
    
    const gameDateTime = new Date(`${gameDate}T${gameTime}`);
    const currentDateTime = new Date(`${currentDate}T${currentTime}`);
    
    if (isNaN(gameDateTime.getTime()) || isNaN(currentDateTime.getTime())) {
      return null;
    }

    return formatDistanceToNow(gameDateTime, { locale: he, addSuffix: true });
  };

  const generateSchedule = async () => {
    if (!currentTime || !gameTime) {
      toast.error("נא למלא את כל השדות הנדרשים");
      return;
    }

    setIsLoading(true);
    try {
      const timeRemaining = calculateTimeRemaining();
      const { data, error } = await supabase.functions.invoke('generate-pre-game-schedule', {
        body: {
          currentDate,
          currentTime,
          gameDate,
          gameTime,
          commitments: commitments || "אין מחויבויות נוספות",
          timeRemaining
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (!data || !data.schedule) {
        throw new Error("Invalid response format from schedule generator");
      }
      
      setSchedule(data.schedule);
      
      // Parse the schedule text into table items
      const items = data.schedule
        .split("\n")
        .filter((line: string) => line.includes(" - ")) // Only include lines with time and activity
        .map((line: string) => {
          const [time, ...activityParts] = line.split(" - ");
          return {
            time: time.trim(),
            activity: activityParts.join(" - ").trim()
          };
        })
        .filter((item: ScheduleItem) => item.time && item.activity); // Filter out any invalid entries
      
      setScheduleItems(items);
      toast.success("סדר היום נוצר בהצלחה!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("שגיאה ביצירת סדר היום");
    } finally {
      setIsLoading(false);
    }
  };

  const copySchedule = () => {
    if (schedule) {
      navigator.clipboard.writeText(schedule);
      toast.success("הטקסט הועתק!");
    }
  };

  const shareSchedule = async () => {
    if (schedule) {
      try {
        await navigator.share({
          title: "סדר יום למשחק",
          text: schedule
        });
      } catch (error) {
        console.error("Error sharing:", error);
        // Fallback to copy if sharing is not supported
        copySchedule();
      }
    }
  };

  const saveSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("משתמש לא מחובר");

      // Convert scheduleItems to the correct format for the database
      const formattedActions = scheduleItems.map(item => ({
        time: item.time,
        description: item.activity
      }));

      const { error } = await supabase.from("pre_match_reports").insert({
        player_id: user.id,
        match_date: gameDate,
        match_time: gameTime,
        actions: formattedActions,
        status: "draft"
      });

      if (error) throw error;
      toast.success("סדר היום נשמר בהצלחה!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("שגיאה בשמירת סדר היום");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-right text-primary">תכנון 24 שעות לפני משחק</h1>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentDate" className="text-primary">תאריך נוכחי</Label>
            <Input
              id="currentDate"
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="text-right"
              dir="ltr"
            />
          </div>
          
          <div>
            <Label htmlFor="currentTime" className="text-primary">שעה נוכחית</Label>
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
            <Label htmlFor="gameDate" className="text-primary">תאריך המשחק</Label>
            <Input
              id="gameDate"
              type="date"
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
              className="text-right"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="gameTime" className="text-primary">שעת המשחק</Label>
            <Input
              id="gameTime"
              type="time"
              value={gameTime}
              onChange={(e) => setGameTime(e.target.value)}
              className="text-right"
              dir="ltr"
            />
          </div>
        </div>

        {calculateTimeRemaining() && (
          <div className="text-right text-primary font-medium">
            זמן עד למשחק: {calculateTimeRemaining()}
          </div>
        )}

        <div>
          <Label htmlFor="commitments" className="text-primary">האם יש בית ספר או מחויבויות נוספות?</Label>
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
          <div className="space-y-6">
            <Card className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-right">סדר היום שלך</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שעה</TableHead>
                      <TableHead className="text-right">פעילות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-right">{item.time}</TableCell>
                        <TableCell className="text-right">{item.activity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (schedule) {
                      navigator.clipboard.writeText(schedule);
                      toast.success("הטקסט הועתק!");
                    }
                  }}
                  variant="secondary"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  העתק
                </Button>
                
                <Button
                  onClick={async () => {
                    if (schedule) {
                      try {
                        await navigator.share({
                          title: "סדר יום למשחק",
                          text: schedule
                        });
                      } catch (error) {
                        console.error("Error sharing:", error);
                        // Fallback to copy if sharing is not supported
                        navigator.clipboard.writeText(schedule);
                        toast.success("הטקסט הועתק!");
                      }
                    }
                  }}
                  variant="secondary"
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  שתף
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) throw new Error("משתמש לא מחובר");

                      const formattedActions = scheduleItems.map(item => ({
                        time: item.time,
                        description: item.activity
                      }));

                      const { error } = await supabase.from("pre_match_reports").insert({
                        player_id: user.id,
                        match_date: gameDate,
                        match_time: gameTime,
                        actions: formattedActions,
                        status: "draft"
                      });

                      if (error) throw error;
                      toast.success("סדר היום נשמר בהצלחה!");
                    } catch (error) {
                      console.error("Error saving schedule:", error);
                      toast.error("שגיאה בשמירת סדר היום");
                    }
                  }}
                  variant="secondary"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  שמור
                </Button>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="secondary"
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  ערוך
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};