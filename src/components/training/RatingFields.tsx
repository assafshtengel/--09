import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { TrainingSummaryFormData } from "./types";

interface RatingFieldsProps {
  form: UseFormReturn<TrainingSummaryFormData>;
}

export const RatingFields = ({ form }: RatingFieldsProps) => {
  return (
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
  );
};