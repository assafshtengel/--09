import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { NotificationData } from "@/types/notifications";

interface NotificationMessageProps {
  form: UseFormReturn<NotificationData>;
}

export const NotificationMessage = ({ form }: NotificationMessageProps) => {
  return (
    <FormField
      control={form.control}
      name="message"
      render={({ field }) => (
        <FormItem>
          <FormLabel>תוכן ההודעה</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder="הכנס את תוכן ההודעה כאן..." />
          </FormControl>
        </FormItem>
      )}
    />
  );
};