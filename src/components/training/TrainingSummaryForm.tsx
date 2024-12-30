import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuestionSelector } from "./QuestionSelector";
import { RatingSliders } from "./form/RatingSliders";
import { DateTimeFields } from "./form/DateTimeFields";
import { AIInsights } from "./AIInsights";
import { Checkbox } from "@/components/ui/checkbox";
import type { TrainingSummaryFormData } from "./types";

export const TrainingSummaryForm = () => {
  const { toast } = useToast();
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [shareWithCoach, setShareWithCoach] = useState(false);
  
  const form = useForm<TrainingSummaryFormData>({
    defaultValues: {
      trainingDate: new Date(),
      trainingTime: format(new Date(), "HH:mm"),
      satisfactionRating: 4,
      challengeHandlingRating: 4,
      energyFocusRating: 4,
      answers: {},
    },
  });

  const getAIInsights = async (data: TrainingSummaryFormData) => {
    setIsLoadingInsights(true);
    try {
      const { data: aiResponse, error } = await supabase.functions.invoke('analyze-training', {
        body: {
          ratings: {
            שביעות_רצון: data.satisfactionRating,
            התמודדות_עם_אתגרים: data.challengeHandlingRating,
            אנרגיה_וריכוז: data.energyFocusRating
          },
          answers: data.answers
        }
      });

      if (error) throw error;
      setInsights(aiResponse.insights);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        title: "שגיאה בקבלת תובנות AI",
        description: "לא הצלחנו לקבל המלצות. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const sendWhatsAppMessage = async (coachPhoneNumber: string, summary: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          message: summary,
          recipientNumber: coachPhoneNumber
        }
      });

      if (error) throw error;

      toast({
        title: "נשלח בהצלחה",
        description: "סיכום האימון נשלח למאמן",
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: "לא הצלחנו לשלוח את ההודעה למאמן. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: TrainingSummaryFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("לא נמצא משתמש מחובר");
      }

      // Get AI insights before saving
      await getAIInsights(data);

      const summary = {
        player_id: user.id,
        training_date: format(data.trainingDate, "yyyy-MM-dd"),
        training_time: data.trainingTime,
        satisfaction_rating: data.satisfactionRating,
        challenge_handling_rating: data.challengeHandlingRating,
        energy_focus_rating: data.energyFocusRating,
        questions_answers: data.answers,
      };

      const { error } = await supabase
        .from('training_summaries')
        .insert(summary);

      if (error) throw error;

      if (shareWithCoach) {
        // Get coach's phone number from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('coach_phone_number')
          .eq('id', user.id)
          .single();

        if (profile?.coach_phone_number) {
          const summaryText = `סיכום אימון מ-${format(data.trainingDate, "dd/MM/yyyy")}:\n` +
            `שביעות רצון: ${data.satisfactionRating}/5\n` +
            `התמודדות עם אתגרים: ${data.challengeHandlingRating}/5\n` +
            `אנרגיה וריכוז: ${data.energyFocusRating}/5\n` +
            `תובנות: ${insights || 'אין תובנות זמינות'}`;

          await sendWhatsAppMessage(profile.coach_phone_number, summaryText);
        }
      }

      toast({
        title: "הסיכום נשמר בהצלחה",
        description: "תודה על מילוי הטופס",
      });
      
      form.reset();
      
    } catch (error) {
      console.error("Error saving training summary:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הסיכום",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <DateTimeFields form={form} />
          <RatingSliders form={form} />

          <QuestionSelector
            onQuestionsSelected={(questions) => setSelectedQuestions(questions)}
          />

          {selectedQuestions.map((question, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`answers.${index}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{question}</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="h-20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="shareWithCoach"
              checked={shareWithCoach}
              onCheckedChange={(checked) => setShareWithCoach(checked as boolean)}
            />
            <label
              htmlFor="shareWithCoach"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              שתף את המאמן בסיכום האימון
            </label>
          </div>
        </div>

        <AIInsights insights={insights} isLoading={isLoadingInsights} />

        <Button type="submit" className="w-full">
          שמור סיכום אימון
        </Button>
      </form>
    </Form>
  );
};