import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, differenceInDays } from "date-fns";
import { he } from "date-fns/locale";
import { MatchQuestionDialog } from "./MatchQuestionDialog";
import { SchoolHoursInput } from "./components/SchoolHoursInput";
import { TrainingHoursInput } from "./components/TrainingHoursInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ScheduleData {
  gameDate: string;
  gameTime: string;
  hasSchool: boolean;
  schoolHours: { [key: string]: { start: string; end: string } | null };
  hasTeamTraining: boolean;
  teamTrainingHours: { [key: string]: { start: string; end: string } };
  otherCommitments?: string;
  notes?: string;
}

export const PreGamePlannerNew = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    gameDate: "",
    gameTime: "",
    hasSchool: false,
    schoolHours: {},
    hasTeamTraining: false,
    teamTrainingHours: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSchoolHours, setShowSchoolHours] = useState(false);
  const [currentSchoolDay, setCurrentSchoolDay] = useState<string | null>(null);
  const [showTrainingHours, setShowTrainingHours] = useState(false);

  const questions = [
    {
      id: "game_date",
      label: "מתי המשחק?",
      type: "date" as const,
    },
    {
      id: "game_time",
      label: "באיזו שעה המשחק?",
      type: "text" as const,
    },
    {
      id: "has_school",
      label: "האם יש לך בית ספר עד המשחק?",
      type: "select" as const,
      options: [
        { value: "yes", label: "כן" },
        { value: "no", label: "לא" },
      ],
    },
    {
      id: "has_team_training",
      label: "האם יש אימון קבוצה לפני המשחק?",
      type: "select" as const,
      options: [
        { value: "yes", label: "כן" },
        { value: "no", label: "לא" },
      ],
    },
    {
      id: "other_commitments",
      label: "האם יש לך מחויבויות נוספות לפני המשחק?",
      type: "text" as const,
    },
  ];

  const getDatesUntilGame = () => {
    const startDate = new Date();
    const gameDate = new Date(scheduleData.gameDate);
    const days = differenceInDays(gameDate, startDate);
    const dates = [];
    
    for (let i = 0; i <= days; i++) {
      dates.push(format(addDays(startDate, i), "yyyy-MM-dd"));
    }
    
    return dates;
  };

  const handleQuestionSubmit = async (value: string) => {
    const currentQuestion = questions[currentStep];

    switch (currentQuestion.id) {
      case "game_date":
        setScheduleData((prev) => ({ ...prev, gameDate: value }));
        setCurrentStep((prev) => prev + 1);
        break;
      case "game_time":
        setScheduleData((prev) => ({ ...prev, gameTime: value }));
        setCurrentStep((prev) => prev + 1);
        break;
      case "has_school":
        setScheduleData((prev) => ({ ...prev, hasSchool: value === "yes" }));
        if (value === "yes") {
          setShowSchoolHours(true);
          setCurrentSchoolDay(getDatesUntilGame()[0]);
        } else {
          setCurrentStep((prev) => prev + 1);
        }
        break;
      case "has_team_training":
        setScheduleData((prev) => ({ ...prev, hasTeamTraining: value === "yes" }));
        if (value === "yes") {
          setShowTrainingHours(true);
        } else {
          setCurrentStep((prev) => prev + 1);
        }
        break;
      case "other_commitments":
        setScheduleData((prev) => ({ ...prev, otherCommitments: value }));
        await generateSchedule();
        break;
    }
  };

  const handleSchoolHoursSubmit = (hours: { start: string; end: string } | null) => {
    if (!currentSchoolDay) return;

    if (hours === null) {
      // Handle case where there's no school on this day
      setScheduleData((prev) => ({
        ...prev,
        schoolHours: {
          ...prev.schoolHours,
          [currentSchoolDay]: null,
        },
      }));
    } else {
      setScheduleData((prev) => ({
        ...prev,
        schoolHours: {
          ...prev.schoolHours,
          [currentSchoolDay]: hours,
        },
      }));
    }

    const dates = getDatesUntilGame();
    const currentIndex = dates.indexOf(currentSchoolDay);
    
    if (currentIndex < dates.length - 1) {
      setCurrentSchoolDay(dates[currentIndex + 1]);
    } else {
      setShowSchoolHours(false);
      setCurrentSchoolDay(null);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleTrainingHoursSubmit = (trainingHours: { [key: string]: { start: string; end: string } }) => {
    setScheduleData((prev) => ({
      ...prev,
      teamTrainingHours: trainingHours,
    }));
    setShowTrainingHours(false);
    setCurrentStep((prev) => prev + 1);
  };

  const generateSchedule = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Call the edge function to generate the schedule
      const { data, error } = await supabase.functions.invoke('generate-pre-game-schedule', {
        body: {
          currentDate: format(new Date(), "yyyy-MM-dd"),
          currentTime: format(new Date(), "HH:mm"),
          gameDate: scheduleData.gameDate,
          gameTime: scheduleData.gameTime,
          schoolHours: scheduleData.schoolHours,
          teamTrainingHours: scheduleData.teamTrainingHours,
          commitments: scheduleData.otherCommitments || "אין מחויבויות נוספות",
        }
      });

      if (error) throw error;

      // Save the schedule to the database with explicit status
      const { error: saveError } = await supabase
        .from('weekly_schedules')
        .insert({
          player_id: user.id,
          start_date: new Date().toISOString(),
          notes: data.schedule,
          status: 'draft',
          is_active: true,
          school_hours: scheduleData.schoolHours,
          training_hours: scheduleData.teamTrainingHours,
          additional_commitments: scheduleData.otherCommitments 
            ? [{ description: scheduleData.otherCommitments }] 
            : []
        });

      if (saveError) throw saveError;

      setScheduleData(prev => ({ ...prev, notes: data.schedule }));
      toast.success("סדר היום נוצר בהצלחה!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error("שגיאה ביצירת סדר היום");
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailSchedule = async (recipient: 'user' | 'coach') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, coach_email')
        .eq('id', user.id)
        .single();

      if (recipient === 'coach' && !profile?.coach_email) {
        toast.error("לא נמצא מייל של המאמן בפרופיל");
        return;
      }

      const recipientEmail = recipient === 'coach' ? profile.coach_email : user.email;
      const playerName = profile?.full_name || "שחקן";

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: [recipientEmail],
          subject: `סדר יום למשחק - ${playerName}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif;">
              <h2>סדר יום למשחק</h2>
              <p>שחקן: ${playerName}</p>
              <div>${scheduleData.notes}</div>
            </div>
          `,
        },
      });

      if (error) throw error;

      toast.success(recipient === 'coach' ? "הסדר יום נשלח למאמן" : "הסדר יום נשלח למייל שלך");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("שגיאה בשליחת המייל");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <div className="space-y-4">
          {!showSchoolHours && !showTrainingHours && (
            <MatchQuestionDialog
              isOpen={currentStep < questions.length}
              onClose={() => {}}
              question={questions[currentStep]}
              value=""
              onSubmit={handleQuestionSubmit}
              onBack={currentStep > 0 ? () => setCurrentStep(prev => prev - 1) : undefined}
              isFirstQuestion={currentStep === 0}
            />
          )}

          {showSchoolHours && currentSchoolDay && (
            <Dialog open={true} onOpenChange={() => {}}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    מה שעות בית הספר ל-{format(new Date(currentSchoolDay), "EEEE, d בMMMM", { locale: he })}?
                  </DialogTitle>
                </DialogHeader>
                <SchoolHoursInput
                  date={currentSchoolDay}
                  onSubmit={handleSchoolHoursSubmit}
                />
              </DialogContent>
            </Dialog>
          )}

          {showTrainingHours && (
            <Dialog open={true} onOpenChange={() => {}}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>באילו ימים יש לך אימון קבוצתי?</DialogTitle>
                </DialogHeader>
                <TrainingHoursInput
                  dates={getDatesUntilGame()}
                  onSubmit={handleTrainingHoursSubmit}
                />
              </DialogContent>
            </Dialog>
          )}

          {scheduleData.notes && (
            <div className="space-y-6">
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => sendEmailSchedule('user')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  שלח למייל שלי
                </Button>
                <Button
                  onClick={() => sendEmailSchedule('coach')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  שלח למאמן
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  הדפס
                </Button>
              </div>

              <Card className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-right">סדר היום שלך</h3>
                  <pre className="whitespace-pre-wrap text-right">{scheduleData.notes}</pre>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
