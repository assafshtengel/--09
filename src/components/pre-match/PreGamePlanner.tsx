import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Printer, Send, Check, Clock, Calendar, Bed, Phone, School, Users } from "lucide-react";
import { format, addMinutes, subMinutes } from "date-fns";

interface ScheduleBlock {
  startTime: string;
  endTime: string;
  activity: string;
  color: string;
}

export const PreGamePlanner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    matchDate: new Date().toISOString().split('T')[0],
    matchTime: "19:00",
    schoolDay: "1", // 1-7 for days of week
    schoolStartTime: "08:00",
    schoolEndTime: "15:00",
    hasTeamTraining: false,
    teamTrainingTime: "",
    sleepHours: 8,
    screenTime: 2,
    departureTime: "",
  });

  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSchedule = async () => {
    setIsLoading(true);
    try {
      // Calculate arrival time (90 minutes before match)
      const matchDateTime = new Date(`${formData.matchDate}T${formData.matchTime}`);
      const arrivalTime = subMinutes(matchDateTime, 90);
      
      // Generate schedule blocks
      const newSchedule: ScheduleBlock[] = [];
      
      // Add sleep block
      newSchedule.push({
        startTime: "22:00",
        endTime: "06:00",
        activity: "שינה",
        color: "bg-blue-100"
      });

      // Add school block if it's a school day
      if (formData.schoolDay !== "7") { // Not Saturday
        newSchedule.push({
          startTime: formData.schoolStartTime,
          endTime: formData.schoolEndTime,
          activity: "בית ספר",
          color: "bg-yellow-100"
        });
      }

      // Add team training if exists
      if (formData.hasTeamTraining && formData.teamTrainingTime) {
        const trainingStart = formData.teamTrainingTime;
        const trainingEnd = addMinutes(new Date(`2024-01-01T${trainingStart}`), 90).toTimeString().slice(0, 5);
        newSchedule.push({
          startTime: trainingStart,
          endTime: trainingEnd,
          activity: "אימון קבוצה",
          color: "bg-green-100"
        });
      }

      // Add match preparation block
      newSchedule.push({
        startTime: format(arrivalTime, "HH:mm"),
        endTime: formData.matchTime,
        activity: "הכנה למשחק",
        color: "bg-purple-100"
      });

      setSchedule(newSchedule);
      toast.success("לוח הזמנים נוצר בהצלחה!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("שגיאה ביצירת לוח הזמנים");
    } finally {
      setIsLoading(false);
    }
  };

  const copySchedule = () => {
    const scheduleText = schedule
      .map(block => `${block.activity}: ${block.startTime} - ${block.endTime}`)
      .join('\n');
    navigator.clipboard.writeText(scheduleText);
    toast.success("הטקסט הועתק!");
  };

  const printSchedule = () => {
    window.print();
  };

  const sendToCoach = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: profile } = await supabase
        .from('profiles')
        .select('coach_phone_number')
        .eq('id', user.id)
        .single();

      if (!profile?.coach_phone_number) {
        toast.error("מספר הטלפון של המאמן לא מוגדר בפרופיל");
        return;
      }

      const scheduleText = schedule
        .map(block => `${block.activity}: ${block.startTime} - ${block.endTime}`)
        .join('\n');

      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: profile.coach_phone_number,
          message: scheduleText
        }
      });

      if (error) throw error;
      toast.success("לוח הזמנים נשלח למאמן!");
    } catch (error) {
      console.error("Error sending schedule to coach:", error);
      toast.error("שגיאה בשליחת לוח הזמנים");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-right text-primary">תכנון לוח זמנים למשחק</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <Label>מתי המשחק?</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={formData.matchDate}
                onChange={(e) => setFormData(prev => ({ ...prev, matchDate: e.target.value }))}
                className="text-right"
              />
              <Input
                type="time"
                value={formData.matchTime}
                onChange={(e) => setFormData(prev => ({ ...prev, matchTime: e.target.value }))}
                className="text-right"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <Label>שעות בית ספר</Label>
            </div>
            <Select
              value={formData.schoolDay}
              onValueChange={(value) => setFormData(prev => ({ ...prev, schoolDay: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר יום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">ראשון</SelectItem>
                <SelectItem value="2">שני</SelectItem>
                <SelectItem value="3">שלישי</SelectItem>
                <SelectItem value="4">רביעי</SelectItem>
                <SelectItem value="5">חמישי</SelectItem>
                <SelectItem value="6">שישי</SelectItem>
                <SelectItem value="7">שבת</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                value={formData.schoolStartTime}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolStartTime: e.target.value }))}
                className="text-right"
                placeholder="שעת התחלה"
              />
              <Input
                type="time"
                value={formData.schoolEndTime}
                onChange={(e) => setFormData(prev => ({ ...prev, schoolEndTime: e.target.value }))}
                className="text-right"
                placeholder="שעת סיום"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <Label>אימון קבוצתי</Label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={formData.hasTeamTraining}
                onChange={(e) => setFormData(prev => ({ ...prev, hasTeamTraining: e.target.checked }))}
                className="w-4 h-4"
              />
              <span>יש אימון קבוצתי</span>
            </div>
            {formData.hasTeamTraining && (
              <Input
                type="time"
                value={formData.teamTrainingTime}
                onChange={(e) => setFormData(prev => ({ ...prev, teamTrainingTime: e.target.value }))}
                className="text-right"
                placeholder="שעת האימון"
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              <Label>שעות שינה</Label>
            </div>
            <Input
              type="number"
              min="4"
              max="12"
              value={formData.sleepHours}
              onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: Number(e.target.value) }))}
              className="text-right"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <Label>זמן מסך ביום המשחק (שעות)</Label>
            </div>
            <Input
              type="number"
              min="0"
              max="24"
              value={formData.screenTime}
              onChange={(e) => setFormData(prev => ({ ...prev, screenTime: Number(e.target.value) }))}
              className="text-right"
            />
          </div>

          <Button 
            onClick={generateSchedule} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "מייצר לוח זמנים..." : "צור לוח זמנים"}
          </Button>
        </Card>

        {schedule.length > 0 && (
          <Card className="p-6">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-right">לוח זמנים למשחק</h2>
              
              <div className="space-y-4">
                {schedule.map((block, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${block.color} transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{block.activity}</span>
                      <span className="text-sm text-gray-600">
                        {block.startTime} - {block.endTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">תזכורות חשובות:</h3>
                <ul className="text-sm space-y-2 list-disc list-inside">
                  <li>הגע למגרש לפחות שעה וחצי לפני תחילת המשחק</li>
                  <li>הקפד על שינה טובה בלילה שלפני המשחק</li>
                  <li>הפחת את זמן המסך ביום המשחק</li>
                  <li>הכן את הציוד שלך מראש</li>
                </ul>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={copySchedule}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  העתק
                </Button>
                <Button
                  onClick={printSchedule}
                  variant="outline"
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  הדפס
                </Button>
                <Button
                  onClick={sendToCoach}
                  variant="outline"
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  שלח למאמן
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};