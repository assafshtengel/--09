import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ScheduleGrid } from "./components/ScheduleGrid";

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
  const [startDayIndex, setStartDayIndex] = useState(0);
  const daysToShow = 3; // Number of days to show at once on desktop
  
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const hours = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

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

  const handleNext = () => {
    if (!isMobile) {
      setStartDayIndex(prev => Math.min(prev + daysToShow, days.length - daysToShow));
    } else {
      setSelectedDay((prev) => (prev < 6 ? prev + 1 : 0));
    }
  };

  const handlePrevious = () => {
    if (!isMobile) {
      setStartDayIndex(prev => Math.max(prev - daysToShow, 0));
    } else {
      setSelectedDay((prev) => (prev > 0 ? prev - 1 : 6));
    }
  };

  const canGoNext = !isMobile ? startDayIndex < days.length - daysToShow : selectedDay < 6;
  const canGoPrevious = !isMobile ? startDayIndex > 0 : selectedDay > 0;

  return (
    <Card className="p-4">
      <ScheduleHeader onPrint={window.print} onCopyLastWeek={async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No authenticated user");

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

          const { data: lastWeekActivities, error: activitiesError } = await supabase
            .from('schedule_activities')
            .select('*')
            .eq('schedule_id', lastWeekSchedule.id);

          if (activitiesError) throw activitiesError;

          if (!lastWeekActivities || lastWeekActivities.length === 0) {
            toast.error("לא נמצאו פעילויות בלוח הזמנים הקודם");
            return;
          }

          const { data: newSchedule, error: newScheduleError } = await supabase
            .from('weekly_schedules')
            .insert({
              player_id: user.id,
              start_date: new Date().toISOString(),
            })
            .select()
            .single();

          if (newScheduleError) throw newScheduleError;

          const { error: copyError } = await supabase
            .from('schedule_activities')
            .insert(
              lastWeekActivities.map(activity => ({
                ...activity,
                id: undefined,
                schedule_id: newSchedule.id,
              }))
            );

          if (copyError) throw copyError;

          toast.success("לוח הזמנים הועתק בהצלחה");
          window.location.reload();
        } catch (error) {
          console.error("Error copying last week's schedule:", error);
          toast.error("שגיאה בהעתקת לוח הזמנים");
        }
      }} />
      
      <div id="weekly-schedule" className="mt-6 print:p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 text-center">
            {!isMobile ? (
              <span className="font-medium">
                {days[startDayIndex]} - {days[Math.min(startDayIndex + daysToShow - 1, days.length - 1)]}
              </span>
            ) : (
              <span className="font-medium">{days[selectedDay]}</span>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={!canGoNext}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {isMobile ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="relative">
              <div className="sticky right-0 bg-background z-10 border-l">
                <div className="h-12 border-b" />
                {hours.map((hour) => (
                  <div key={hour} className="h-16 border-b px-2 text-sm text-muted-foreground">
                    {hour}
                  </div>
                ))}
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
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="flex">
              <div className="sticky right-0 bg-background z-10 border-l">
                <div className="h-12 border-b" />
                {hours.map((hour) => (
                  <div key={hour} className="h-16 border-b px-2 text-sm text-muted-foreground">
                    {hour}
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex min-w-[600px]">
                  {days.slice(startDayIndex, startDayIndex + daysToShow).map((day, index) => (
                    <ScheduleGrid
                      key={startDayIndex + index}
                      activities={activities.filter(a => a.day_of_week === startDayIndex + index)}
                      days={[day]}
                      hours={hours}
                      isMobile={false}
                      selectedDay={startDayIndex + index}
                      onDeleteActivity={handleDeleteActivity}
                    />
                  ))}
                </div>
              </div>
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
        }
      `}</style>
    </Card>
  );
};