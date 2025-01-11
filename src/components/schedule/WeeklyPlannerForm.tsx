import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeeklyScheduleViewer } from "./WeeklyScheduleViewer";
import { useWeeklySchedule } from "@/hooks/use-weekly-schedule";
import { toast } from "sonner";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Activity {
  day_of_week: number;
  start_time: string;
  end_time: string;
  activity_type: string;
  title?: string;
}

const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export const WeeklyPlannerForm = () => {
  const [selectedDay, setSelectedDay] = useState<string>(days[0]);
  const [sleepStart, setSleepStart] = useState("22:00");
  const [sleepEnd, setSleepEnd] = useState("07:00");
  const [phoneTime, setPhoneTime] = useState("2");
  const [teamPractice, setTeamPractice] = useState("");
  const [personalTraining, setPersonalTraining] = useState("");
  const [gameDateTime, setGameDateTime] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const { saveSchedule, isLoading } = useWeeklySchedule();

  const handleAddActivity = (type: string) => {
    const dayIndex = days.indexOf(selectedDay);
    let newActivity: Activity;

    switch (type) {
      case "sleep":
        newActivity = {
          day_of_week: dayIndex,
          start_time: sleepStart,
          end_time: sleepEnd,
          activity_type: "wake_up", // Changed from "sleep" to "wake_up"
          title: "שינה",
        };
        break;
      case "team_training":
        newActivity = {
          day_of_week: dayIndex,
          start_time: teamPractice.split("T")[1],
          end_time: new Date(new Date(`2024-01-01T${teamPractice.split("T")[1]}`).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "team_training",
          title: "אימון קבוצתי",
        };
        break;
      case "personal_training":
        newActivity = {
          day_of_week: dayIndex,
          start_time: personalTraining.split("T")[1],
          end_time: new Date(new Date(`2024-01-01T${personalTraining.split("T")[1]}`).getTime() + 1 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "personal_training",
          title: "אימון אישי",
        };
        break;
      case "game":
        newActivity = {
          day_of_week: dayIndex,
          start_time: gameDateTime.split("T")[1],
          end_time: new Date(new Date(`2024-01-01T${gameDateTime.split("T")[1]}`).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "team_game", // Changed from "game" to "team_game"
          title: "משחק",
        };
        break;
      default:
        return;
    }

    setActivities(prev => [...prev, newActivity]);
  };

  const handleSave = async () => {
    try {
      await saveSchedule(activities);
      toast.success("המערכת נשמרה בהצלחה");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("שגיאה בשמירת המערכת");
    }
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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">מערכת שבועית לספורטאים</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label>בחר יום</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="בחר יום" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>שעות שינה</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">התחלה</Label>
                  <Input
                    type="time"
                    value={sleepStart}
                    onChange={(e) => setSleepStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">סיום</Label>
                  <Input
                    type="time"
                    value={sleepEnd}
                    onChange={(e) => setSleepEnd(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => handleAddActivity("sleep")}
              >
                הוסף שעות שינה
              </Button>
            </div>

            <div className="space-y-2">
              <Label>זמן מסך יומי (שעות)</Label>
              <Input
                type="number"
                min="0"
                max="24"
                value={phoneTime}
                onChange={(e) => setPhoneTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>אימון קבוצתי</Label>
              <Input
                type="datetime-local"
                value={teamPractice}
                onChange={(e) => setTeamPractice(e.target.value)}
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleAddActivity("team_training")}
              >
                הוסף אימון קבוצתי
              </Button>
            </div>

            <div className="space-y-2">
              <Label>אימון אישי</Label>
              <Input
                type="datetime-local"
                value={personalTraining}
                onChange={(e) => setPersonalTraining(e.target.value)}
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleAddActivity("personal_training")}
              >
                הוסף אימון אישי
              </Button>
            </div>

            <div className="space-y-2">
              <Label>משחק</Label>
              <Input
                type="datetime-local"
                value={gameDateTime}
                onChange={(e) => setGameDateTime(e.target.value)}
              />
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleAddActivity("game")}
              >
                הוסף משחק
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button 
              className="flex-1" 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "שומר..." : "שמור מערכת"}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDownloadPDF}
            >
              <Download className="ml-2 h-4 w-4" />
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
