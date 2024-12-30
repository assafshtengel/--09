import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { NotificationData } from "@/types/notifications";

interface NotificationScheduleProps {
  form: UseFormReturn<NotificationData>;
}

export const NotificationSchedule = ({ form }: NotificationScheduleProps) => {
  return (
    <FormField
      control={form.control}
      name="scheduled_for"
      render={({ field }) => (
        <FormItem>
          <FormLabel>מועד שליחה</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-right",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>בחר תאריך</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(date);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormControl>
        </FormItem>
      )}
    />
  );
};