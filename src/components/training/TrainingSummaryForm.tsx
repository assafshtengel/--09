import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
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
import { Card } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

type TrainingSummary = Database['public']['Tables']['training_summaries']['Insert'];

interface TrainingSummaryFormData {
  trainingDate: Date;
  trainingTime: string;
  satisfactionRating: number;
  challengeHandlingRating: number;
  energyFocusRating: number;
  answers: Record<string, string>;
}

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
      const { data: insights, error } = await supabase.functions.invoke('generate-training-insights', {
        body: { trainingData: data }
      });

      if (error) throw error;
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

      const { error } = await supabase
        .from('training_summaries')
        .insert(summary);

      if (error) throw error;

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

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="satisfactionRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>עד כמה אתה מרוצה מהביצועים שלך באימון היום?</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={7}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>חלש</span>
                      <span>מצוין</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challengeHandlingRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>איך התמודדת עם אתגרים או תרגילים קשים?</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={7}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>חלש</span>
                      <span>מצוין</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="energyFocusRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>איך היו רמות האנרגיה והריכוז שלך במהלך האימון?</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={7}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>חלש</span>
                      <span>מצוין</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
            {isLoading ? "שומר..." : "שמור סיכום אימון"}
          </Button>
        </form>
      </Form>

      {aiInsights && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <h3 className="text-xl font-bold mb-4 text-right">תובנות מקצועיות</h3>
          <div className="text-right whitespace-pre-line">{aiInsights}</div>
        </Card>
      )}
    </div>
  );
};