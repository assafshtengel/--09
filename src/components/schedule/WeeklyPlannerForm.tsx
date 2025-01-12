import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "lucide-react";
import { WeeklyScheduleViewer } from "./WeeklyScheduleViewer";
import { ScheduleChat } from "./components/ScheduleChat";

interface ScheduleData {
  sleepHours: number;
  screenTime: number;
  hasSchool: boolean;
  schoolDays?: {
    [key: number]: {
      startTime: string;
      endTime: string;
    };
  };
}

export const WeeklyPlannerForm = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    sleepHours: 8,
    screenTime: 2,
    hasSchool: false
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleStepComplete = (stepId: string, value: any) => {
    setScheduleData(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const generateSchedule = async () => {
    setIsLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('generate-pre-game-schedule', {
        body: {
          sleepHours: scheduleData.sleepHours,
          screenTime: scheduleData.screenTime,
          hasSchool: scheduleData.hasSchool,
          schoolDays: scheduleData.schoolDays
        }
      });

      if (error) throw error;

      setActivities(response.schedule);
      toast.success("המערכת נוצרה בהצלחה!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("שגיאה ביצירת המערכת");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatComplete = () => {
    setShowChat(false);
    generateSchedule();
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

      {showChat ? (
        <ScheduleChat
          onStepComplete={handleStepComplete}
          onComplete={handleChatComplete}
        />
      ) : (
        <>
          {activities.length > 0 && (
            <div className="mt-8">
              <WeeklyScheduleViewer activities={activities} />
              <div className="mt-4 flex justify-end gap-2">
                <Button onClick={() => setShowChat(true)}>
                  ערוך מחדש
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};