import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface PreMatchQuestionnaireProps {
  onSubmit: (answers: Record<string, string>) => void;
  onNext: () => void;
}

const formSchema = z.object({
  answers: z.record(z.string())
});

type FormValues = z.infer<typeof formSchema>;

export const PreMatchQuestionnaire = ({ onSubmit, onNext }: PreMatchQuestionnaireProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: {}
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
          {/* Example form fields */}
          <FormField
            control={form.control}
            name="answers.question1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שאלה 1</FormLabel>
                <Textarea {...field} className="mt-1" dir="rtl" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="answers.question2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שאלה 2</FormLabel>
                <Textarea {...field} className="mt-1" dir="rtl" />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
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