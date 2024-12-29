import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ActivityBlock } from "./components/ActivityBlock";

interface Activity {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  activity_type: string;
  title?: string;
}

interface WeeklyScheduleViewerProps {
  activities: Activity[];
}

export const WeeklyScheduleViewer = ({ activities }: WeeklyScheduleViewerProps) => {
  const isMobile = useIsMobile();
  const [selectedDay, setSelectedDay] = useState(0);
  
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const hours = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

  const formatTime = (time: string | number): string => {
    if (typeof time === 'string') return time;
    const date = new Date(time);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handlePrint = () => {
    window.print();
    toast.success("המערכת נשלחה להדפסה");
  };

  const handleDeleteActivity = async (activityId?: string) => {
    if (!activityId) {
      toast.error("לא ניתן למחוק את הפעילות");
      return;
    }

    try {
      const { error } = await supabase
        .from('schedule_activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
      toast.success("הפעילות נמחקה בהצלחה");
      // Refresh the page to update the schedule
      window.location.reload();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("שגיאה במחיקת הפעילות");
    }
  };

  const handleCopyLastWeek = async () => {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Get the last week's schedule
      const { data: lastWeekSchedule, error: scheduleError } = await supabase
        .from('weekly_schedules')
        .select('id')
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (scheduleError) throw scheduleError;

      if (!lastWeekSchedule) {
        toast.error("לא נמצא לוח זמנים קודם");
        return;
      }

      // Get the activities from the last week
      const { data: lastWeekActivities, error: activitiesError } = await supabase
        .from('schedule_activities')
        .select('*')
        .eq('schedule_id', lastWeekSchedule.id);

      if (activitiesError) throw activitiesError;

      if (!lastWeekActivities || lastWeekActivities.length === 0) {
        toast.error("לא נמצאו פעילויות בלוח הזמנים הקודם");
        return;
      }

      // Create a new schedule for this week
      const { data: newSchedule, error: newScheduleError } = await supabase
        .from('weekly_schedules')
        .insert({
          player_id: user.id,
          start_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (newScheduleError) throw newScheduleError;

      // Copy all activities to the new schedule
      const { error: copyError } = await supabase
        .from('schedule_activities')
        .insert(
          lastWeekActivities.map(activity => ({
            ...activity,
            id: undefined, // Remove the old ID to generate a new one
            schedule_id: newSchedule.id,
          }))
        );

      if (copyError) throw copyError;

      toast.success("לוח הזמנים הועתק בהצלחה");
      // Refresh the page to show the new schedule
      window.location.reload();
    } catch (error) {
      console.error("Error copying last week's schedule:", error);
      toast.error("שגיאה בהעתקת לוח הזמנים");
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "school":
        return "bg-blue-100 border-blue-200";
      case "team_training":
        return "bg-green-100 border-green-200";
      case "team_game":
        return "bg-red-100 border-red-200";
      case "personal_training":
      case "mental_training":
        return "bg-purple-100 border-purple-200";
      case "lunch":
        return "bg-yellow-100 border-yellow-200";
      case "free_time":
        return "bg-gray-100 border-gray-200";
      case "wake_up":
        return "bg-orange-100 border-orange-200";
      case "departure":
        return "bg-red-100 border-red-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "school":
        return "🏫";
      case "team_training":
        return "⚽";
      case "team_game":
        return "🏆";
      case "personal_training":
        return "🏃";
      case "mental_training":
        return "🧠";
      case "lunch":
        return "🍽️";
      case "free_time":
        return "🎮";
      case "wake_up":
        return "⏰";
      case "departure":
        return "🚗";
      default:
        return "📝";
    }
  };

  const renderDayView = (dayIndex: number) => (
    <div className="min-w-[120px]">
      <div className="font-bold mb-2 text-center bg-gray-50 p-2 rounded">{days[dayIndex]}</div>
      <div className="relative h-[900px] border-r border-gray-100">
        {activities
          .filter((activity) => activity.day_of_week === dayIndex)
          .map((activity, activityIndex) => {
            const startTime = formatTime(activity.start_time);
            const endTime = formatTime(activity.end_time);
            
            const startHour = parseInt(startTime.split(':')[0]);
            const startMinute = parseInt(startTime.split(':')[1]);
            const endHour = parseInt(endTime.split(':')[0]);
            const endMinute = parseInt(endTime.split(':')[1]);
            
            const top = ((startHour - 6) * 60 + startMinute) * (50 / 60);
            const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (50 / 60);
            
            return (
              <ActivityBlock
                key={activityIndex}
                activity={activity}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  minHeight: '24px'
                }}
                colorClass={getActivityColor(activity.activity_type)}
                icon={getActivityIcon(activity.activity_type)}
                onDelete={() => handleDeleteActivity(activity.id)}
              />
            );
          })}
      </div>
    </div>
  );

  return (
    <Card className="p-4 overflow-x-auto">
      <ScheduleHeader onPrint={handlePrint} onCopyLastWeek={handleCopyLastWeek} />
      
      <div id="weekly-schedule" className="print:p-4">
        {isMobile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 print:hidden">
              <Button variant="outline" size="icon" onClick={() => setSelectedDay((prev) => (prev > 0 ? prev - 1 : 6))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h4 className="text-lg font-semibold">{days[selectedDay]}</h4>
              <Button variant="outline" size="icon" onClick={() => setSelectedDay((prev) => (prev < 6 ? prev + 1 : 0))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex">
              <div className="w-16 flex-shrink-0">
                {hours.map((hour) => (
                  <div key={hour} className="h-20 border-b border-gray-200 text-sm text-gray-500 text-center">
                    {hour}
                  </div>
                ))}
              </div>
              {renderDayView(selectedDay)}
            </div>
          </div>
        ) : (
          <div className="flex print:scale-100 print:transform-none">
            <div className="w-16 flex-shrink-0 print:w-12">
              {hours.map((hour) => (
                <div key={hour} className="h-20 border-b border-gray-200 text-sm text-gray-500 text-center print:h-16 print:text-xs">
                  {hour}
                </div>
              ))}
            </div>
            
            <div className="flex-1 grid grid-cols-7 gap-1">
              {days.map((day, dayIndex) => renderDayView(dayIndex))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          #weekly-schedule {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 1cm;
            background: white;
            box-shadow: none;
          }
          .Card {
            box-shadow: none;
            border: none;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-blue-100 { background-color: #dbeafe !important; }
          .bg-green-100 { background-color: #dcfce7 !important; }
          .bg-red-100 { background-color: #fee2e2 !important; }
          .bg-purple-100 { background-color: #f3e8ff !important; }
          .bg-yellow-100 { background-color: #fef9c3 !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-orange-100 { background-color: #ffedd5 !important; }
        }
      `}</style>
    </Card>
  );
};