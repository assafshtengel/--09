import { useState } from "react";
import { Card } from "@/components/ui/card";
import { WeeklyScheduleForm } from "./WeeklyScheduleForm";
import { WeeklyScheduleDisplay } from "./WeeklyScheduleDisplay";
import { Button } from "@/components/ui/button";
import { useWeeklySchedule } from "@/hooks/use-weekly-schedule";
import { toast } from "sonner";
import { ChatScheduleForm } from "./ChatScheduleForm";

export const WeeklyPlannerLayout = () => {
  const [schedule, setSchedule] = useState<any>(null);
  const { saveSchedule, isLoading } = useWeeklySchedule();

  const handleGeneratePlan = async () => {
    if (!schedule) {
      toast.error("נא למלא את המערכת תחילה");
      return;
    }
    
    try {
      await saveSchedule(schedule);
      toast.success("המערכת נשמרה בהצלחה");
    } catch (error) {
      toast.error("שגיאה בשמירת המערכת");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8 rtl">
      <h1 className="text-3xl font-bold text-center mb-8">תכנון שבועי לספורטאים</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <ChatScheduleForm onScheduleChange={setSchedule} />
        </Card>
        
        <Card className="p-6">
          <WeeklyScheduleDisplay schedule={schedule} />
          
          <div className="mt-6 flex flex-wrap gap-4">
            <Button 
              onClick={handleGeneratePlan}
              disabled={isLoading || !schedule}
              className="w-full md:w-auto"
            >
              צור תכנית שבועית
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full md:w-auto"
              onClick={() => {/* TODO: Implement PDF export */}}
            >
              ייצא ל-PDF
            </Button>
            
            <Button 
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => {/* TODO: Implement email sending */}}
            >
              שלח למאמן
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};