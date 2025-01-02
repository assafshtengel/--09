import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { TrainingSummaryFormData } from "../types";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface RatingSlidersProps {
  form: UseFormReturn<TrainingSummaryFormData>;
}

export const RatingSliders = ({ form }: RatingSlidersProps) => {
  const [currentValues, setCurrentValues] = useState({
    satisfactionRating: form.getValues("satisfactionRating"),
    challengeHandlingRating: form.getValues("challengeHandlingRating"),
    energyFocusRating: form.getValues("energyFocusRating"),
  });

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="satisfactionRating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>עד כמה אתה מרוצה מהביצועים שלך באימון היום?</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl>
                <Slider
                  min={1}
                  max={7}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    setCurrentValues(prev => ({ ...prev, satisfactionRating: value[0] }));
                  }}
                  className="w-full"
                />
              </FormControl>
              <Badge variant="secondary">{currentValues.satisfactionRating}/7</Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>7</span>
              <span>1</span>
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
            <div className="flex items-center gap-2">
              <FormControl>
                <Slider
                  min={1}
                  max={7}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    setCurrentValues(prev => ({ ...prev, challengeHandlingRating: value[0] }));
                  }}
                  className="w-full"
                />
              </FormControl>
              <Badge variant="secondary">{currentValues.challengeHandlingRating}/7</Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>7</span>
              <span>1</span>
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
            <div className="flex items-center gap-2">
              <FormControl>
                <Slider
                  min={1}
                  max={7}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => {
                    field.onChange(value[0]);
                    setCurrentValues(prev => ({ ...prev, energyFocusRating: value[0] }));
                  }}
                  className="w-full"
                />
              </FormControl>
              <Badge variant="secondary">{currentValues.energyFocusRating}/7</Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>7</span>
              <span>1</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};