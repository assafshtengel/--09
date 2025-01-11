import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Printer, Send, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ScheduleFormData {
  currentDateTime: string;
  gameDateTime: string;
  schoolHours: string;
  teamTrainings: string;
  personalTrainings: string;
  otherCommitments: string;
  screenTime: number;
  sleepHours: number;
}

export const PreGamePlanner = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ScheduleFormData>({
    currentDateTime: new Date().toISOString().slice(0, 16),
    gameDateTime: "",
    schoolHours: "",
    teamTrainings: "",
    personalTrainings: "",
    otherCommitments: "",
    screenTime: 2,
    sleepHours: 8,
  });
  const [schedule, setSchedule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const generateSchedule = async () => {
    if (!formData.gameDateTime) {
      toast.error("נא למלא את תאריך ושעת המשחק");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pre-game-schedule', {
        body: {
          ...formData
        }
      });

      if (error) throw error;
      setSchedule(data.schedule);
      toast.success("סדר היום נוצר בהצלחה!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("שגיאה ביצירת סדר היום");
    } finally {
      setIsLoading(false);
    }
  };

  const copySchedule = () => {
    if (schedule) {
      navigator.clipboard.writeText(schedule);
      toast.success("הטקסט הועתק!");
    }
  };

  const printSchedule = () => {
    if (schedule) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl">
            <head>
              <title>לוח זמנים למשחק</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                pre { white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>לוח זמנים למשחק</h1>
              <pre>${schedule}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const sendToCoach = async () => {
    if (!schedule) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data: profile } = await supabase
        .from('profiles')
        .select('coach_phone_number')
        .eq('id', user.id)
        .single();

      if (!profile?.coach_phone_number) {
        toast.error("מספר הטלפון של המאמן לא מוגדר בפרופיל");
        return;
      }

      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: profile.coach_phone_number,
          message: schedule
        }
      });

      if (error) throw error;
      toast.success("לוח הזמנים נשלח למאמן!");
    } catch (error) {
      console.error("Error sending schedule to coach:", error);
      toast.error("שגיאה בשליחת לוח הזמנים");
    }
  };

  const handleFinish = () => {
    setShowHelpDialog(true);
  };

  const handleHelpResponse = (needsHelp: boolean) => {
    setShowHelpDialog(false);
    if (needsHelp) {
      navigate("/dashboard", { state: { openMentalChat: true } });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-right text-primary">תכנון לוח זמנים לפני משחק</h1>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentDateTime">מתי עכשיו?</Label>
            <Input
              id="currentDateTime"
              type="datetime-local"
              value={formData.currentDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, currentDateTime: e.target.value }))}
              className="text-right"
              dir="ltr"
            />
          </div>

          <div>
            <Label htmlFor="gameDateTime">מתי המשחק?</Label>
            <Input
              id="gameDateTime"
              type="datetime-local"
              value={formData.gameDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, gameDateTime: e.target.value }))}
              className="text-right"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="schoolHours">זמני בית ספר</Label>
          <Textarea
            id="schoolHours"
            value={formData.schoolHours}
            onChange={(e) => setFormData(prev => ({ ...prev, schoolHours: e.target.value }))}
            placeholder="פרט את שעות בית הספר שלך"
            className="text-right"
          />
        </div>

        <div>
          <Label htmlFor="teamTrainings">אימוני קבוצה</Label>
          <Textarea
            id="teamTrainings"
            value={formData.teamTrainings}
            onChange={(e) => setFormData(prev => ({ ...prev, teamTrainings: e.target.value }))}
            placeholder="פרט את זמני אימוני הקבוצה"
            className="text-right"
          />
        </div>

        <div>
          <Label htmlFor="personalTrainings">אימונים אישיים</Label>
          <Textarea
            id="personalTrainings"
            value={formData.personalTrainings}
            onChange={(e) => setFormData(prev => ({ ...prev, personalTrainings: e.target.value }))}
            placeholder="פרט את זמני האימונים האישיים"
            className="text-right"
          />
        </div>

        <div>
          <Label htmlFor="otherCommitments">מחויבויות נוספות</Label>
          <Textarea
            id="otherCommitments"
            value={formData.otherCommitments}
            onChange={(e) => setFormData(prev => ({ ...prev, otherCommitments: e.target.value }))}
            placeholder="פרט מחויבויות נוספות (חברים, משפחה וכו')"
            className="text-right"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="screenTime">שעות מסך ביום</Label>
            <Input
              id="screenTime"
              type="number"
              min="0"
              max="24"
              value={formData.screenTime}
              onChange={(e) => setFormData(prev => ({ ...prev, screenTime: Number(e.target.value) }))}
              className="text-right"
            />
          </div>

          <div>
            <Label htmlFor="sleepHours">שעות שינה רצויות</Label>
            <Input
              id="sleepHours"
              type="number"
              min="4"
              max="12"
              value={formData.sleepHours}
              onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: Number(e.target.value) }))}
              className="text-right"
            />
          </div>
        </div>

        <Button 
          onClick={generateSchedule} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "מייצר סדר יום..." : "צור לוח זמנים"}
        </Button>

        {schedule && (
          <Card className="p-4 mt-4 relative">
            <pre className="whitespace-pre-wrap text-right text-lg leading-relaxed text-primary" dir="rtl">
              {schedule}
            </pre>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={copySchedule}
                variant="outline"
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                העתק
              </Button>
              <Button
                onClick={printSchedule}
                variant="outline"
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                הדפס
              </Button>
              <Button
                onClick={sendToCoach}
                variant="outline"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                שלח למאמן
              </Button>
              <Button
                onClick={handleFinish}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                סיים
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>האם אתה צריך עזרה מקצועית?</DialogTitle>
            <DialogDescription>
              אנחנו יכולים לחבר אותך למאמן מנטאלי, מאמן תזונה, מאמן כושר או מאמן טקטיקה.
              זה יכול לעזור לך להתכונן טוב יותר למשחק!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => handleHelpResponse(false)}>
              לא, תודה
            </Button>
            <Button onClick={() => handleHelpResponse(true)}>
              כן, אשמח לעזרה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};