import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { TrainingSummaryFormData } from "../types";

interface DateTimeFieldsProps {
  form: UseFormReturn<TrainingSummaryFormData>;
}

export const DateTimeFields = ({ form }: DateTimeFieldsProps) => {
  return (
    <>
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
    </>
  );
};