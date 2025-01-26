import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "lucide-react";

interface PreMatchQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void;
  onNext: () => void;
}

const formSchema = z.object({
  answers: z.record(z.string())
});

type FormValues = z.infer<typeof formSchema>;

const preMatchQuestions = [
  {
    id: "mental_video_reflection",
    question: "צפה בסרטון המנטאלי, מה הדבר העיקרי שאתה לומד ואיך תיישם אותו במשחק הקרוב?",
    videoLink: "https://example.com/mental-video",
    isFixed: true
  },
  {
    id: "physical_video_reflection",
    question: "צפה בסרטון הפיזי, איך אתה מתכנן ליישם את הטכניקות במשחק?",
    videoLink: "https://example.com/physical-video",
    isFixed: true
  },
  {
    id: "mental_preparation",
    question: "איך אתה מרגיש מבחינה מנטלית לקראת המשחק?"
  },
  {
    id: "physical_condition",
    question: "איך אתה מרגיש מבחינה פיזית לקראת המשחק?"
  },
  {
    id: "team_confidence",
    question: "מה רמת הביטחון שלך ביכולת הקבוצה להשיג את המטרות במשחק?"
  },
  {
    id: "personal_goals",
    question: "מהם היעדים האישיים שלך למשחק הזה?"
  },
  {
    id: "opponent_analysis",
    question: "מה אתה יודע על היריב ואיך אתה מתכונן להתמודד איתו?"
  }
];

export const PreMatchQuestionnaire = ({ onSubmit, onNext }: PreMatchQuestionnaireProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: preMatchQuestions.reduce((acc, q) => ({ ...acc, [q.id]: "" }), {})
    }
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values.answers);
    onNext();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">שאלון טרום משחק</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {preMatchQuestions.map((q) => (
            <FormField
              key={q.id}
              control={form.control}
              name={`answers.${q.id}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    {q.question}
                    {q.isFixed && q.videoLink && (
                      <a 
                        href={q.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mr-2 text-primary hover:text-primary/80"
                      >
                        <Link className="h-4 w-4" />
                        צפה בסרטון
                      </a>
                    )}
                  </FormLabel>
                  <Textarea 
                    {...field} 
                    className="mt-2 min-h-[100px]" 
                    dir="rtl"
                    placeholder="הכנס את תשובתך כאן..."
                  />
                </FormItem>
              )}
            />
          ))}
          
          <div className="flex justify-end pt-4">
            <Button 
              type="submit"
              size="lg"
              className="w-full md:w-auto"
            >
              המשך
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};