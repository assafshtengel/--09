import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeeklyScheduleViewer } from "./WeeklyScheduleViewer";
import { useWeeklySchedule } from "@/hooks/use-weekly-schedule";
import { toast } from "sonner";
import { Calendar, Clock, Plus, Save, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface Activity {
  day_of_week: number;
  start_time: string;
  end_time: string;
  activity_type: string;
  title?: string;
}

export const WeeklyPlannerForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sleepHours, setSleepHours] = useState("8");
  const [selectedDay, setSelectedDay] = useState<string>("0");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teamPractice, setTeamPractice] = useState("");
  const [personalTraining, setPersonalTraining] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const { saveSchedule, isLoading } = useWeeklySchedule();

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const steps = [
    {
      title: "שעות שינה",
      description: "כמה שעות שינה אתה צריך? (מומלץ: 8-9 שעות)",
      component: (
        <Input
          type="number"
          min="4"
          max="12"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
          className="w-24"
        />
      ),
    },
    {
      title: "אימוני קבוצה",
      description: "באילו ימים יש לך אימון קבוצתי?",
      component: (
        <div className="space-y-4">
          <RadioGroup
            value={selectedDay}
            onValueChange={setSelectedDay}
            className="grid grid-cols-7 gap-2"
          >
            {days.map((day, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`day-${index}`} />
                <Label htmlFor={`day-${index}`}>{day}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedDay && (
            <div className="flex gap-2">
              <Input
                type="time"
                value={teamPractice}
                onChange={(e) => setTeamPractice(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => handleAddActivity("team_training", parseInt(selectedDay))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "אימונים אישיים",
      description: "באילו ימים יש לך אימון אישי?",
      component: (
        <div className="space-y-4">
          <RadioGroup
            value={selectedDay}
            onValueChange={setSelectedDay}
            className="grid grid-cols-7 gap-2"
          >
            {days.map((day, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`day-${index}`} />
                <Label htmlFor={`day-${index}`}>{day}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedDay && (
            <div className="flex gap-2">
              <Input
                type="time"
                value={personalTraining}
                onChange={(e) => setPersonalTraining(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => handleAddActivity("personal_training", parseInt(selectedDay))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "אירועים מיוחדים",
      description: "האם יש לך אירועים מיוחדים השבוע?",
      component: (
        <div className="space-y-4">
          <RadioGroup
            value={selectedDay}
            onValueChange={setSelectedDay}
            className="grid grid-cols-7 gap-2"
          >
            {days.map((day, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`day-${index}`} />
                <Label htmlFor={`day-${index}`}>{day}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedDay && (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="שם האירוע"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => handleAddActivity("event", parseInt(selectedDay))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleAddActivity = (type: string, dayIndex: number) => {
    let newActivity: Activity;

    switch (type) {
      case "team_training":
        if (!teamPractice) {
          toast.error("נא להזין שעת אימון");
          return;
        }
        newActivity = {
          day_of_week: dayIndex,
          start_time: teamPractice,
          end_time: new Date(new Date(`2024-01-01T${teamPractice}`).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "team_training",
          title: "אימון קבוצתי",
        };
        break;
      case "personal_training":
        if (!personalTraining) {
          toast.error("נא להזין שעת אימון אישי");
          return;
        }
        newActivity = {
          day_of_week: dayIndex,
          start_time: personalTraining,
          end_time: new Date(new Date(`2024-01-01T${personalTraining}`).getTime() + 1 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "personal_training",
          title: "אימון אישי",
        };
        break;
      case "event":
        if (!eventTime || !eventTitle) {
          toast.error("נא להזין שעת וכותרת האירוע");
          return;
        }
        newActivity = {
          day_of_week: dayIndex,
          start_time: eventTime,
          end_time: new Date(new Date(`2024-01-01T${eventTime}`).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "event",
          title: eventTitle,
        };
        break;
      default:
        return;
    }

    setActivities(prev => [...prev, newActivity]);
    toast.success("הפעילות נוספה בהצלחה");
  };

  const generateMealsAndFreeTime = (currentActivities: Activity[]): Activity[] => {
    const newActivities: Activity[] = [];
    
    days.forEach((_, dayIndex) => {
      // Add sleep schedule based on user input
      newActivities.push({
        day_of_week: dayIndex,
        start_time: "22:00",
        end_time: `0${parseInt(sleepHours)}:00`,
        activity_type: "sleep",
        title: "שינה",
      });

      // Breakfast
      newActivities.push({
        day_of_week: dayIndex,
        start_time: "07:30",
        end_time: "08:00",
        activity_type: "meal",
        title: "ארוחת בוקר",
      });
      
      // Lunch
      newActivities.push({
        day_of_week: dayIndex,
        start_time: "13:00",
        end_time: "13:30",
        activity_type: "meal",
        title: "ארוחת צהריים",
      });
      
      // Dinner
      newActivities.push({
        day_of_week: dayIndex,
        start_time: "19:00",
        end_time: "19:30",
        activity_type: "meal",
        title: "ארוחת ערב",
      });
    });

    return newActivities;
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("weekly-schedule");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("weekly-schedule.pdf");
      toast.success("המערכת הורדה בהצלחה");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("שגיאה בהורדת המערכת");
    }
  };

  const handleSave = async () => {
    try {
      const mealsAndFreeTime = generateMealsAndFreeTime(activities);
      const updatedActivities = [...activities, ...mealsAndFreeTime];
      
      await saveSchedule(updatedActivities);
      toast.success("המערכת נשמרה בהצלחה");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("שגיאה בשמירת המערכת");
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-primary">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
              {steps[currentStep].component}
            </div>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
              >
                הקודם
              </Button>
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={currentStep === steps.length - 1}
              >
                הבא
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button 
              className={cn(
                "flex items-center gap-2",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              {isLoading ? "שומר..." : "שמור מערכת"}
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4" />
              הורד PDF
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <WeeklyScheduleViewer activities={activities} />
        </div>
      </div>
    </div>
  );
};