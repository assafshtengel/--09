import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Printer, Send, Check, Clock, Calendar, Bed, Phone, School, Users, Coffee, Apple, Dumbbell } from "lucide-react";
import { format, addMinutes, subMinutes } from "date-fns";
import { WeeklyScheduleViewer } from "./WeeklyScheduleViewer";
import { cn } from "@/lib/utils";

interface ScheduleBlock {
  startTime: string;
  endTime: string;
  activity: string;
  color: string;
}

export const WeeklyPlannerForm = () => {
  const [formData, setFormData] = useState({
    matchDate: new Date().toISOString().split('T')[0],
    matchTime: "19:00",
    schoolDay: "1",
    schoolStartTime: "08:00",
    schoolEndTime: "15:00",
    hasTeamTraining: false,
    teamTrainingTime: "",
    sleepHours: 8,
    screenTime: 2,
    breakfastTime: "07:00",
    lunchTime: "13:00",
    stretchingTime: "17:00",
    departureTime: "",
  });

  const [schedule, setSchedule] = useState<ScheduleBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const generateAISchedule = async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke('generate-pre-game-schedule', {
        body: {
          sleepHours: formData.sleepHours,
          screenTime: formData.screenTime,
          schoolHours: formData.schoolDay !== "7" ? {
            start: formData.schoolStartTime,
            end: formData.schoolEndTime
          } : null,
          teamTraining: formData.hasTeamTraining ? formData.teamTrainingTime : null
        }
      });

      if (error) throw error;

      // Process AI response and update activities
      const aiActivities = processAISchedule(response.schedule);
      setActivities(aiActivities);
      toast.success("המערכת נוצרה בהצלחה!");
    } catch (error) {
      console.error("Error generating AI schedule:", error);
      toast.error("שגיאה ביצירת המערכת");
    }
  };

  const processAISchedule = (aiSchedule: any) => {
    // Convert AI schedule to activities format
    const processedActivities = [];
    
    days.forEach((_, dayIndex) => {
      // Add sleep
      processedActivities.push({
        day_of_week: dayIndex,
        start_time: "22:00",
        end_time: `0${formData.sleepHours}:00`,
        activity_type: "other",
        title: "שינה"
      });

      // Add meals
      const meals = [
        { time: "07:30", title: "ארוחת בוקר" },
        { time: "13:00", title: "ארוחת צהריים" },
        { time: "19:00", title: "ארוחת ערב" }
      ];

      meals.forEach(meal => {
        processedActivities.push({
          day_of_week: dayIndex,
          start_time: meal.time,
          end_time: addMinutes(new Date(`2024-01-01T${meal.time}`), 30).toTimeString().slice(0, 5),
          activity_type: "lunch",
          title: meal.title
        });
      });

      // Add school if it's a school day
      if (formData.schoolDay !== "7" && dayIndex.toString() === formData.schoolDay) {
        processedActivities.push({
          day_of_week: dayIndex,
          start_time: formData.schoolStartTime,
          end_time: formData.schoolEndTime,
          activity_type: "school",
          title: "בית ספר"
        });
      }

      // Add team training if exists
      if (formData.hasTeamTraining) {
        processedActivities.push({
          day_of_week: dayIndex,
          start_time: formData.teamTrainingTime,
          end_time: addMinutes(new Date(`2024-01-01T${formData.teamTrainingTime}`), 90).toTimeString().slice(0, 5),
          activity_type: "team_training",
          title: "אימון קבוצה"
        });
      }

      // Add stretching
      processedActivities.push({
        day_of_week: dayIndex,
        start_time: formData.stretchingTime,
        end_time: addMinutes(new Date(`2024-01-01T${formData.stretchingTime}`), 30).toTimeString().slice(0, 5),
        activity_type: "personal_training",
        title: "מתיחות"
      });
    });

    return processedActivities;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          מערכת שבועית לספורטאים
        </h1>
        <p className="text-gray-600">תכנן את השבוע שלך בצורה חכמה ויעילה</p>
      </div>

      <Card className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="space-y-6">
          {/* Sleep Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              <Label>כמה שעות שינה אתה צריך? (מומלץ: 8-9 שעות)</Label>
            </div>
            <Input
              type="number"
              min="4"
              max="12"
              value={formData.sleepHours}
              onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: Number(e.target.value) }))}
              className="w-24"
            />
          </div>

          {/* Screen Time */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <Label>זמן מסך ביום (שעות)</Label>
            </div>
            <Input
              type="number"
              min="0"
              max="24"
              value={formData.screenTime}
              onChange={(e) => setFormData(prev => ({ ...prev, screenTime: Number(e.target.value) }))}
              className="w-24"
            />
          </div>

          {/* School Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <Label>שעות בית ספר</Label>
            </div>
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

          {/* Team Training */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <Label>אימונים</Label>
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

          <Button 
            onClick={generateAISchedule}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "מייצר מערכת..." : "צור מערכת שבועית"}
          </Button>
        </div>
      </Card>

      {activities.length > 0 && (
        <div className="mt-8">
          <WeeklyScheduleViewer activities={activities} />
        </div>
      )}
    </div>
  );
};