import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WeeklyScheduleViewer } from "./WeeklyScheduleViewer";
import { useWeeklySchedule } from "@/hooks/use-weekly-schedule";
import { toast } from "sonner";
import { Download, Calendar, Clock, Mail, Save, Share2, Users, Gift, Trophy } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { cn } from "@/lib/utils";

interface Activity {
  day_of_week: number;
  start_time: string;
  end_time: string;
  activity_type: string;
  title?: string;
}

export const WeeklyPlannerForm = () => {
  const [sleepStart, setSleepStart] = useState("22:00");
  const [sleepEnd, setSleepEnd] = useState("07:00");
  const [phoneTime, setPhoneTime] = useState("2");
  const [teamPractice, setTeamPractice] = useState("");
  const [personalTraining, setPersonalTraining] = useState("");
  const [gameDateTime, setGameDateTime] = useState("");
  const [familyEvent, setFamilyEvent] = useState("");
  const [friendsEvent, setFriendsEvent] = useState("");
  const [favoriteGame, setFavoriteGame] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const { saveSchedule, isLoading } = useWeeklySchedule();

  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

  const handleAddActivity = (type: string, dayIndex: number) => {
    let newActivity: Activity;

    switch (type) {
      case "sleep":
        newActivity = {
          day_of_week: dayIndex,
          start_time: sleepStart,
          end_time: sleepEnd,
          activity_type: "sleep",
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
          activity_type: "game",
          title: "משחק",
        };
        break;
      case "family":
        newActivity = {
          day_of_week: dayIndex,
          start_time: familyEvent.split("T")[1],
          end_time: new Date(new Date(`2024-01-01T${familyEvent.split("T")[1]}`).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "family",
          title: "אירוע משפחתי",
        };
        break;
      case "friends":
        newActivity = {
          day_of_week: dayIndex,
          start_time: friendsEvent.split("T")[1],
          end_time: new Date(new Date(`2024-01-01T${friendsEvent.split("T")[1]}`).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "friends",
          title: "מפגש חברים",
        };
        break;
      case "favorite_game":
        newActivity = {
          day_of_week: dayIndex,
          start_time: favoriteGame.split("T")[1],
          end_time: new Date(new Date(`2024-01-01T${favoriteGame.split("T")[1]}`).getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5),
          activity_type: "favorite_game",
          title: "משחק אהוד",
        };
        break;
      default:
        return;
    }

    setActivities(prev => [...prev, newActivity]);
  };

  const generateMealsAndFreeTime = (currentActivities: Activity[]): Activity[] => {
    const newActivities: Activity[] = [];
    
    // Add meals for each day
    days.forEach((_, dayIndex) => {
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
      // Add AI-generated meals and free time
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
            {/* Sleep Hours */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Clock className="h-5 w-5" />
                שעות שינה
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">התחלה</Label>
                  <Input
                    type="time"
                    value={sleepStart}
                    onChange={(e) => setSleepStart(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">סיום</Label>
                  <Input
                    type="time"
                    value={sleepEnd}
                    onChange={(e) => setSleepEnd(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <Button 
                  key={dayIndex}
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleAddActivity("sleep", dayIndex)}
                >
                  הוסף שעות שינה ליום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][dayIndex]}
                </Button>
              ))}
            </section>

            {/* Screen Time - Smaller Input */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">זמן מסך יומי</h3>
              <div>
                <Label>שעות שימוש במסך</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  value={phoneTime}
                  onChange={(e) => setPhoneTime(e.target.value)}
                  className="mt-1 w-24" // Smaller width
                />
              </div>
            </section>

            {/* Team Training */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                אימון קבוצתי
              </h3>
              <div>
                <Label>בחר יום ושעה</Label>
                <Input
                  type="datetime-local"
                  value={teamPractice}
                  onChange={(e) => setTeamPractice(e.target.value)}
                  className="mt-1"
                />
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <Button 
                  key={dayIndex}
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleAddActivity("team_training", dayIndex)}
                >
                  הוסף אימון קבוצתי ליום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][dayIndex]}
                </Button>
              ))}
            </section>

            {/* Personal Training */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-primary">אימון אישי</h3>
              <div>
                <Label>בחר יום ושעה</Label>
                <Input
                  type="datetime-local"
                  value={personalTraining}
                  onChange={(e) => setPersonalTraining(e.target.value)}
                  className="mt-1"
                />
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <Button 
                  key={dayIndex}
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleAddActivity("personal_training", dayIndex)}
                >
                  הוסף אימון אישי ליום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][dayIndex]}
                </Button>
              ))}
            </section>

            {/* Family Event */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Gift className="h-5 w-5" />
                אירוע משפחתי
              </h3>
              <div>
                <Label>בחר יום ושעה</Label>
                <Input
                  type="datetime-local"
                  value={familyEvent}
                  onChange={(e) => setFamilyEvent(e.target.value)}
                  className="mt-1"
                />
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <Button 
                  key={dayIndex}
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleAddActivity("family", dayIndex)}
                >
                  הוסף אירוע משפחתי ליום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][dayIndex]}
                </Button>
              ))}
            </section>

            {/* Friends Event */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                מפגש חברים
              </h3>
              <div>
                <Label>בחר יום ושעה</Label>
                <Input
                  type="datetime-local"
                  value={friendsEvent}
                  onChange={(e) => setFriendsEvent(e.target.value)}
                  className="mt-1"
                />
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <Button 
                  key={dayIndex}
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleAddActivity("friends", dayIndex)}
                >
                  הוסף מפגש חברים ליום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][dayIndex]}
                </Button>
              ))}
            </section>

            {/* Favorite Game */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                משחק אהוד
              </h3>
              <div>
                <Label>בחר יום ושעה</Label>
                <Input
                  type="datetime-local"
                  value={favoriteGame}
                  onChange={(e) => setFavoriteGame(e.target.value)}
                  className="mt-1"
                />
              </div>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <Button 
                  key={dayIndex}
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleAddActivity("favorite_game", dayIndex)}
                >
                  הוסף משחק אהוד ליום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][dayIndex]}
                </Button>
              ))}
            </section>
          </div>

          {/* Action Buttons */}
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
