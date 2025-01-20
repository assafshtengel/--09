import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ScheduleGrid } from "./components/ScheduleGrid";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Activity {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  activity_type: "other" | "school" | "team_training" | "personal_training" | "mental_training" | "free_time" | "lunch" | "wake_up" | "departure" | "team_game" | "exam_prep" | "social_event" | "meal" | "travel";
  title?: string;
}

interface WeeklyScheduleViewerProps {
  activities: Activity[];
}

export const WeeklyScheduleViewer = ({ activities }: WeeklyScheduleViewerProps) => {
  const isMobile = useIsMobile();
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const hours = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
        // Optional: refresh activities data here if needed
        window.location.reload();
      }
    }, 60000); // Check every minute

    return () => clearInterval(timer);
  }, [currentDate]);

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
      window.location.reload();
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("שגיאה במחיקת הפעילות");
    }
  };

  const formattedDate = format(currentDate, "EEEE, dd/MM/yyyy", { locale: he });

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold text-primary">{formattedDate}</h2>
      </div>
      
      <ScheduleHeader onPrint={window.print} onCopyLastWeek={async () => {
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
      }} />
      
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
            
            <ScheduleGrid
              activities={activities}
              days={days}
              hours={hours}
              isMobile={isMobile}
              selectedDay={selectedDay}
              onDeleteActivity={handleDeleteActivity}
            />
          </div>
        ) : (
          <ScheduleGrid
            activities={activities}
            days={days}
            hours={hours}
            isMobile={isMobile}
            selectedDay={selectedDay}
            onDeleteActivity={handleDeleteActivity}
          />
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