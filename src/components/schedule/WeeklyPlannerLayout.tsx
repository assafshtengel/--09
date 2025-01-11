import { useState } from "react";
import { Card } from "@/components/ui/card";
import { WeeklyScheduleForm } from "./WeeklyScheduleForm";
import { WeeklyScheduleDisplay } from "./WeeklyScheduleDisplay";
import { Button } from "@/components/ui/button";
import { useWeeklySchedule } from "@/hooks/use-weekly-schedule";
import { toast } from "sonner";

export const WeeklyPlannerLayout = () => {
  const [schedule, setSchedule] = useState<any>(null);
  const { saveSchedule, isLoading } = useWeeklySchedule();

  const handleGeneratePlan = async () => {
    if (!schedule) {
      toast.error("Please fill in your schedule first");
      return;
    }
    
    try {
      await saveSchedule(schedule);
      toast.success("Schedule saved successfully");
    } catch (error) {
      toast.error("Failed to save schedule");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Weekly Planner for Athletes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <WeeklyScheduleForm onScheduleChange={setSchedule} />
        </Card>
        
        <Card className="p-6">
          <WeeklyScheduleDisplay schedule={schedule} />
          
          <div className="mt-6 flex flex-wrap gap-4">
            <Button 
              onClick={handleGeneratePlan}
              disabled={isLoading || !schedule}
              className="w-full md:w-auto"
            >
              Generate Weekly Plan
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full md:w-auto"
              onClick={() => {/* TODO: Implement PDF export */}}
            >
              Export as PDF
            </Button>
            
            <Button 
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => {/* TODO: Implement email sending */}}
            >
              Send to Coach
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};