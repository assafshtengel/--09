import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuestionSelector } from "./QuestionSelector";
import { RatingFields } from "./RatingFields";
import { AIInsights } from "./AIInsights";
import type { Database } from "@/integrations/supabase/types";
import type { TrainingSummaryFormData } from "./types";

type TrainingSummary = Database['public']['Tables']['training_summaries']['Insert'];

export const TrainingSummaryForm = () => {
  const { toast } = useToast();
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
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

  const generateAiInsights = async (data: TrainingSummaryFormData) => {
    try {
      console.log('Generating AI insights for training data:', data);
      const { data: insights, error } = await supabase.functions.invoke('generate-training-insights', {
        body: { trainingData: data }
      });

      if (error) {
        console.error('Error from Edge Function:', error);
        throw error;
      }

      console.log('Received AI insights:', insights);
      return insights.insights;
    } catch (error) {
      console.error("Error generating AI insights:", error);
      throw error;
    }
  };

  const onSubmit = async (data: TrainingSummaryFormData) => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("לא נמצא משתמש מחובר");
      }

      const summary: TrainingSummary = {
        player_id: user.id,
        training_date: format(data.trainingDate, "yyyy-MM-dd"),
        training_time: data.trainingTime,
        satisfaction_rating: data.satisfactionRating,
        challenge_handling_rating: data.challengeHandlingRating,
        energy_focus_rating: data.energyFocusRating,
        questions_answers: data.answers,
      };

      const { error: saveError } = await supabase
        .from('training_summaries')
        .insert(summary);

      if (saveError) throw saveError;

      // Generate AI insights after successful submission
      const insights = await generateAiInsights(data);
      setAiInsights(insights);

      toast({
        title: "הסיכום נשמר בהצלחה",
        description: "תודה על מילוי הטופס",
      });
      
    } catch (error) {
      console.error("Error saving training summary:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הסיכום",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="trainingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תאריך האימון</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      className="rounded-md border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שעת האימון</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <RatingFields form={form} />

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
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "מעבד את הנתונים ומיד יוצגו לך תובנות האימון..." : "שמור סיכום אימון"}
          </Button>
        </form>
      </Form>

      {aiInsights && <AIInsights insights={aiInsights} />}
    </div>
  );
};
