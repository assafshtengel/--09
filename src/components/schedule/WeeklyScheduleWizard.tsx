import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SchoolHoursStep } from "./steps/SchoolHoursStep";
import { TeamTrainingStep } from "./steps/TeamTrainingStep";
import { PersonalTrainingStep } from "./steps/PersonalTrainingStep";
import { DailyRoutineStep } from "./steps/DailyRoutineStep";
import { WeeklyScheduleViewer } from "./WeeklyScheduleViewer";
import { ArrowRight, ArrowLeft, Save } from "lucide-react";
import { useWeeklySchedule } from "@/hooks/use-weekly-schedule";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const WeeklyScheduleWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { saveSchedule, isLoading } = useWeeklySchedule();
  const [activities, setActivities] = useState<any[]>([]);

  // Memoize step components to prevent unnecessary re-renders
  const steps = [
    {
      title: "שעות בית ספר",
      component: <SchoolHoursStep onAddActivity={useCallback((activity) => {
        console.log("Adding school activity:", activity);
        setActivities(prev => [...prev, {
          ...activity,
          activity_type: "school",
          title: "בית ספר"
        }]);
      }, [])} />,
    },
    {
      title: "אימוני קבוצה",
      component: <TeamTrainingStep onAddActivity={useCallback((activity) => {
        console.log("Adding team training:", activity);
        setActivities(prev => [...prev, {
          ...activity,
          activity_type: "team_training",
          title: activity.title || "אימון קבוצה"
        }]);
      }, [])} />,
    },
    {
      title: "אימונים אישיים ומנטליים",
      component: <PersonalTrainingStep onAddActivity={useCallback((activity) => {
        console.log("Adding personal training:", activity);
        setActivities(prev => [...prev, {
          ...activity,
          activity_type: activity.type || "personal_training",
          title: activity.title || "אימון אישי"
        }]);
      }, [])} />,
    },
    {
      title: "שגרה יומית",
      component: <DailyRoutineStep onAddActivity={useCallback((activity) => {
        console.log("Adding daily routine:", activity);
        setActivities(prev => [...prev, {
          ...activity,
          activity_type: activity.type || "other",
          title: activity.title || "פעילות יומית"
        }]);
      }, [])} />,
    },
  ];

  const optimizeSchedule = async (scheduleId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-schedule-optimizations', {
        body: {
          activities,
          scheduleId
        }
      });

      if (error) throw error;

      if (data.optimizedSchedule) {
        setActivities(prev => [...prev, ...data.optimizedSchedule]);
        toast.success('המערכת עודכנה עם ארוחות ואופטימיזציות');
      }
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      toast.error('שגיאה באופטימיזציית המערכת');
    }
  };

  const handleNext = () => {
    // Save current step's activities before moving to next step
    console.log("Current activities before next:", activities);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving activities:", activities);
      const scheduleId = await saveSchedule(activities);
      await optimizeSchedule(scheduleId);
      toast.success("המערכת השבועית נשמרה בהצלחה");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("אירעה שגיאה בשמירת המערכת השבועית");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-right">{steps[currentStep].title}</h2>
        
        <div className="mb-8">
          {steps[currentStep].component}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
          >
            <ArrowRight className="ml-2" />
            חזור
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="ml-2" />
              {isLoading ? "שומר..." : "שמור מערכת"}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              המשך
              <ArrowLeft className="mr-2" />
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-8">
        <WeeklyScheduleViewer activities={activities} />
      </div>
    </div>
  );
};