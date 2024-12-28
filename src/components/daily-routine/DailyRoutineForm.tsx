import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDailyRoutine } from "@/hooks/use-daily-routine";
import { DailyRoutineHistory } from "./DailyRoutineHistory";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const DailyRoutineForm = () => {
  const navigate = useNavigate();
  const { saveDailyRoutine, isLoading } = useDailyRoutine();
  const [sleepHours, setSleepHours] = useState("");
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [snacks, setSnacks] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveDailyRoutine({
        sleep_hours: Number(sleepHours),
        breakfast,
        lunch,
        dinner,
        snacks,
        water_intake: waterIntake ? Number(waterIntake) : undefined,
        notes
      });
      
      // Show success toast
      toast.success("הנתונים נשמרו בהצלחה", {
        duration: 1500,
      });

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      toast.error("שגיאה בשמירת הנתונים");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-right">תזונה ושינה</h1>
      
      <Tabs defaultValue="new" dir="rtl">
        <TabsList className="w-full justify-end mb-6">
          <TabsTrigger value="new">דיווח חדש</TabsTrigger>
          <TabsTrigger value="history">היסטוריה</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="sleep">שעות שינה</Label>
                <Input
                  id="sleep"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  required
                  placeholder="כמה שעות ישנת?"
                />
              </div>

              <div>
                <Label htmlFor="breakfast">ארוחת בוקר</Label>
                <Textarea
                  id="breakfast"
                  value={breakfast}
                  onChange={(e) => setBreakfast(e.target.value)}
                  placeholder="מה אכלת בארוחת הבוקר?"
                />
              </div>

              <div>
                <Label htmlFor="lunch">ארוחת צהריים</Label>
                <Textarea
                  id="lunch"
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  placeholder="מה אכלת בארוחת הצהריים?"
                />
              </div>

              <div>
                <Label htmlFor="dinner">ארוחת ערב</Label>
                <Textarea
                  id="dinner"
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  placeholder="מה אכלת בארוחת הערב?"
                />
              </div>

              <div>
                <Label htmlFor="snacks">חטיפים</Label>
                <Textarea
                  id="snacks"
                  value={snacks}
                  onChange={(e) => setSnacks(e.target.value)}
                  placeholder="אילו חטיפים אכלת במהלך היום?"
                />
              </div>

              <div>
                <Label htmlFor="water">כוסות מים</Label>
                <Input
                  id="water"
                  type="number"
                  min="0"
                  value={waterIntake}
                  onChange={(e) => setWaterIntake(e.target.value)}
                  placeholder="כמה כוסות מים שתית?"
                />
              </div>

              <div>
                <Label htmlFor="notes">הערות נוספות</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות נוספות על התזונה והשינה שלך"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "שומר..." : "שמור נתונים יומיים"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="history">
          <DailyRoutineHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};