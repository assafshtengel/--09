import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Share2, Edit, Save, Mail } from "lucide-react";
import { format, formatDistanceToNow, parse, isValid, addDays } from "date-fns";
import { he } from "date-fns/locale";
import { useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScheduleItem {
  date: Date;
  time: string;
  activity: string;
}

export const PreGamePlanner = () => {
  const location = useLocation();
  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [currentTime, setCurrentTime] = useState(format(new Date(), "HH:mm"));
  const [gameDate, setGameDate] = useState("");
  const [gameTime, setGameTime] = useState("");
  const [commitments, setCommitments] = useState("");
  const [schedule, setSchedule] = useState<string | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (location.state?.fromPreMatchReport) {
      const { matchDate, matchTime } = location.state;
      if (matchDate) {
        setGameDate(matchDate);
      }
      if (matchTime) {
        setGameTime(matchTime);
      }
    }
  }, [location]);

  const calculateTimeRemaining = () => {
    if (!gameDate || !gameTime) return null;
    
    try {
      const gameDateTime = new Date(`${gameDate}T${gameTime}`);
      const currentDateTime = new Date(`${currentDate}T${currentTime}`);
      
      if (isNaN(gameDateTime.getTime()) || isNaN(currentDateTime.getTime())) {
        return null;
      }

      return formatDistanceToNow(gameDateTime, { locale: he, addSuffix: true });
    } catch (error) {
      console.error("Error calculating time remaining:", error);
      return null;
    }
  };

  const cleanTimeString = (timeStr: string): string => {
    return timeStr.replace(/\*/g, '').trim();
  };

  const isValidTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(cleanTimeString(time));
  };

  const createDateFromTimeString = (baseDate: Date, timeStr: string): Date | null => {
    try {
      const cleanTime = cleanTimeString(timeStr);
      const [hours, minutes] = cleanTime.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      const newDate = new Date(baseDate);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate;
    } catch (error) {
      console.error("Error creating date from time string:", error);
      return null;
    }
  };

  const parseScheduleItem = (line: string): { time: string; activity: string } | null => {
    try {
      const timeMatch = line.match(/^\**(\d{1,2}:\d{2})\**\s*-\s*/);
      if (!timeMatch) return null;

      const time = timeMatch[1];
      const activity = line.substring(timeMatch[0].length).trim();

      return { time, activity };
    } catch (error) {
      console.error("Error parsing schedule item:", error);
      return null;
    }
  };

  const generateSchedule = async () => {
    if (!currentTime || !gameTime || !isValidTimeFormat(currentTime) || !isValidTimeFormat(gameTime)) {
      toast.error("נא למלא את כל השדות הנדרשים בפורמט תקין");
      return;
    }

    if (!gameDate) {
      toast.error("נא לבחור תאריך משחק");
      return;
    }

    const currentDateTime = new Date(`${currentDate}T${currentTime}`);
    const gameDateTime = new Date(`${gameDate}T${gameTime}`);

    if (gameDateTime <= currentDateTime) {
      toast.error("תאריך ושעת המשחק חייבים להיות בעתיד");
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

      if (error) throw error;
      if (!data || !data.schedule) {
        throw new Error("Invalid response format from schedule generator");
      }
      
      setSchedule(data.schedule);
      
      const baseDate = new Date(`${currentDate}T${currentTime}`);
      const items = data.schedule
        .split("\n")
        .map((line: string) => {
          const parsedItem = parseScheduleItem(line);
          if (!parsedItem) return null;

          const { time, activity } = parsedItem;
          
          if (!isValidTimeFormat(time)) {
            console.warn(`Invalid time format: ${time}`);
            return null;
          }

          let itemDateTime = createDateFromTimeString(baseDate, time);
          if (!itemDateTime) {
            console.warn(`Could not create date for time: ${time}`);
            return null;
          }

          if (itemDateTime < baseDate) {
            itemDateTime = addDays(itemDateTime, 1);
          }

          while (
            itemDateTime < gameDateTime && 
            format(itemDateTime, "yyyy-MM-dd") !== gameDate
          ) {
            itemDateTime = addDays(itemDateTime, 1);
          }

          return {
            date: itemDateTime,
            time,
            activity
          };
        })
        .filter((item): item is ScheduleItem => item !== null);

      setScheduleItems(items);
      toast.success("סדר היום נוצר בהצלחה!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("שגיאה ביצירת סדר היום");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateWithDay = (date: Date) => {
    return format(date, "EEEE, dd/MM/yyyy", { locale: he });
  };

  const groupedScheduleItems = scheduleItems.reduce((groups: { [key: string]: ScheduleItem[] }, item) => {
    try {
      const dateKey = format(item.date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    } catch (error) {
      console.error("Error grouping schedule item:", error);
    }
    return groups;
  }, {});

  const sendEmailSchedule = async (recipient: 'user' | 'coach') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, coach_email')
        .eq('id', user.id)
        .single();

      if (recipient === 'coach' && !profile?.coach_email) {
        toast.error("לא נמצא מייל של המאמן בפרופיל");
        return;
      }

      const recipientEmail = recipient === 'coach' ? profile.coach_email : user.email;
      const playerName = profile?.full_name || "שחקן";

      const scheduleHtml = Object.entries(groupedScheduleItems)
        .map(([dateKey, items]) => `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2563eb;">${format(new Date(dateKey), "dd/MM/yyyy", { locale: he })}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <th style="text-align: right; padding: 8px; border: 1px solid #e5e7eb;">שעה</th>
                <th style="text-align: right; padding: 8px; border: 1px solid #e5e7eb;">פעילות</th>
              </tr>
              ${items.map(item => `
                <tr>
                  <td style="text-align: right; padding: 8px; border: 1px solid #e5e7eb;">${item.time}</td>
                  <td style="text-align: right; padding: 8px; border: 1px solid #e5e7eb;">${item.activity}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `).join('');

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: [recipientEmail, 'socr.co.il@gmail.com'],
          subject: `סדר יום למשחק - ${playerName}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif;">
              <h2 style="color: #1E40AF;">סדר יום למשחק</h2>
              <p>שחקן: ${playerName}</p>
              ${scheduleHtml}
            </div>
          `,
        },
      });

      if (error) throw error;

      toast.success(recipient === 'coach' ? "הסדר יום נשלח למאמן" : "הסדר יום נשלח למייל שלך");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("שגיאה בשליחת המייל");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
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
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => sendEmailSchedule('user')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  שלח למייל שלי
                </Button>
                <Button
                  onClick={() => sendEmailSchedule('coach')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  שלח למאמן
                </Button>
              </div>

              <Card className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-right">סדר היום שלך</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">יום ותאריך</TableHead>
                        <TableHead className="text-right">שעה</TableHead>
                        <TableHead className="text-right">פעילות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(groupedScheduleItems).map(([dateKey, items]) => {
                        const formattedDate = formatDateWithDay(new Date(dateKey));
                        return items.map((item, index) => (
                          <TableRow key={`${dateKey}-${index}`}>
                            <TableCell className="font-medium text-right">
                              {index === 0 ? formattedDate : ""}
                            </TableCell>
                            <TableCell className="font-medium text-right">{item.time}</TableCell>
                            <TableCell className="text-right">{item.activity}</TableCell>
                          </TableRow>
                        ));
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
