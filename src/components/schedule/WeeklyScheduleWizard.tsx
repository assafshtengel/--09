import { useState } from "react";
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

export const WeeklyScheduleWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { saveSchedule, isLoading } = useWeeklySchedule();
  const [activities, setActivities] = useState<any[]>([]);

  const steps = [
    {
      title: "שעות בית ספר",
      component: <SchoolHoursStep onAddActivity={(activity) => setActivities([...activities, activity])} />,
    },
    {
      title: "אימוני קבוצה",
      component: <TeamTrainingStep onAddActivity={(activity) => setActivities([...activities, activity])} />,
    },
    {
      title: "אימונים אישיים ומנטליים",
      component: <PersonalTrainingStep onAddActivity={(activity) => setActivities([...activities, activity])} />,
    },
    {
      title: "שגרה יומית",
      component: <DailyRoutineStep onAddActivity={(activity) => setActivities([...activities, activity])} />,
    },
  ];

  const handleNext = () => {
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
      await saveSchedule(activities);
      toast.success("המערכת השבועית נשמרה בהצלחה");
    } catch (error) {
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