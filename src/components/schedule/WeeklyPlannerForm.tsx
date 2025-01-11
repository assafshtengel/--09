import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeeklyScheduleViewer } from "./WeeklyScheduleViewer";
import { useWeeklySchedule } from "@/hooks/use-weekly-schedule";
import { toast } from "sonner";
import { Calendar, Clock, Save, Download, Check } from "lucide-react";
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
  const [schoolHours, setSchoolHours] = useState({ start: "08:00", end: "15:00" });
  const [screenTime, setScreenTime] = useState("");
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
      title: "שעות בית ספר",
      description: "באילו ימים יש לך בית ספר?",
      component: (
        <div className="space-y-4">
          <RadioGroup
            value={selectedDay}
            onValueChange={setSelectedDay}
            className="grid grid-cols-7 gap-2"
          >
            {days.slice(0, 6).map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <RadioGroupItem value={index.toString()} id={`school-day-${index}`} />
                <Label htmlFor={`school-day-${index}`}>{day}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>שעת התחלה</Label>
                <Input
                  type="time"
                  value={schoolHours.start}
                  onChange={(e) => setSchoolHours(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <Label>שעת סיום</Label>
                <Input
                  type="time"
                  value={schoolHours.end}
                  onChange={(e) => setSchoolHours(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <Button
                className="col-span-2"
                onClick={() => handleAddActivity("school", parseInt(selectedDay))}
              >
                <Check className="h-4 w-4 ml-2" />
                הוסף שעות בית ספר
              </Button>
            </div>
          )}
        </div>
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
              <div key={index} className="flex flex-col items-center space-y-2">
                <RadioGroupItem value={index.toString()} id={`team-day-${index}`} />
                <Label htmlFor={`team-day-${index}`}>{day}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedDay && (
            <div className="space-y-4">
              <div>
                <Label>שעת אימון</Label>
                <Input
                  type="time"
                  value={teamPractice}
                  onChange={(e) => setTeamPractice(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleAddActivity("team_training", parseInt(selectedDay))}
              >
                <Check className="h-4 w-4 ml-2" />
                הוסף אימון קבוצתי
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
              <div key={index} className="flex flex-col items-center space-y-2">
                <RadioGroupItem value={index.toString()} id={`personal-day-${index}`} />
                <Label htmlFor={`personal-day-${index}`}>{day}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedDay && (
            <div className="space-y-4">
              <div>
                <Label>שעת אימון</Label>
                <Input
                  type="time"
                  value={personalTraining}
                  onChange={(e) => setPersonalTraining(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleAddActivity("personal_training", parseInt(selectedDay))}
              >
                <Check className="h-4 w-4 ml-2" />
                הוסף אימון אישי
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "זמן מסך",
      description: "כמה זמן מסך ביום?",
      component: (
        <div className="space-y-4">
          <RadioGroup
            value={selectedDay}
            onValueChange={setSelectedDay}
            className="grid grid-cols-7 gap-2"
          >
            {days.map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <RadioGroupItem value={index.toString()} id={`screen-day-${index}`} />
                <Label htmlFor={`screen-day-${index}`}>{day}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedDay && (
            <div className="space-y-4">
              <div>
                <Label>זמן מסך</Label>
                <Input
                  type="time"
                  value={screenTime}
                  onChange={(e) => setScreenTime(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleAddActivity("screen_time", parseInt(selectedDay))}
              >
                <Check className="h-4 w-4 ml-2" />
                הוסף זמן מסך
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
              <div key={index} className="flex flex-col items-center space-y-2">
                <RadioGroupItem value={index.toString()} id={`event-day-${index}`} />
                <Label htmlFor={`event-day-${index}`}>{day}</Label>
              </div>
            ))}
          </RadioGroup>
          {selectedDay && (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="שם האירוע"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
              <div>
                <Label>שעת האירוע</Label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleAddActivity("event", parseInt(selectedDay))}
              >
                <Check className="h-4 w-4 ml-2" />
                הוסף אירוע
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleAddActivity = (type: string, dayIndex: number) => {
    let newActivity: Activity;

    switch (type) {
      case "school":
        if (!schoolHours.start || !schoolHours.end) {
          toast.error("נא להזין שעות בית ספר");
          return;
        }
        newActivity = {
          day_of_week: dayIndex,
          start_time: schoolHours.start,
          end_time: schoolHours.end,
          activity_type: "school",
          title: "בית ספר",
        };
        break;
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
      case "screen_time":
        if (!screenTime) {
          toast.error("נא להזין זמן מסך");
          return;
        }
        newActivity = {
          day_of_week: dayIndex,
          start_time: screenTime,
          end_time: new Date(new Date(`2024-01-01T${screenTime}`).getTime() + 1 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "screen_time",
          title: "זמן מסך",
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
    
    // Reset form fields
    setEventTitle("");
    setEventTime("");
    setTeamPractice("");
    setPersonalTraining("");
    setScreenTime("");
    setSelectedDay("");
  };

  const generateMealsAndFreeTime = (currentActivities: Activity[]): Activity[] => {
    const newActivities: Activity[] = [];
    
    days.forEach((_, dayIndex) => {
      // Add sleep schedule based on user input, using "other" type
      newActivities.push({
        day_of_week: dayIndex,
        start_time: "22:00",
        end_time: `0${parseInt(sleepHours)}:00`,
        activity_type: "other", // Changed from "sleep" to "other"
        title: "שינה",
      });

      // Breakfast
      newActivities.push({
        day_of_week: dayIndex,
        start_time: "07:30",
        end_time: "08:00",
        activity_type: "lunch", // Using "lunch" type for meals
        title: "ארוחת בוקר",
      });
      
      // Lunch
      newActivities.push({
        day_of_week: dayIndex,
        start_time: "13:00",
        end_time: "13:30",
        activity_type: "lunch",
        title: "ארוחת צהריים",
      });
      
      // Dinner
      newActivities.push({
        day_of_week: dayIndex,
        start_time: "19:00",
        end_time: "19:30",
        activity_type: "lunch",
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

