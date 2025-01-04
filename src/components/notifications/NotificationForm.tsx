import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationFormData {
  message: string;
  scheduledFor: Date;
  condition?: string;
  recipientId?: string;
}

export const NotificationForm = () => {
  const [date, setDate] = useState<Date>();
  const form = useForm<NotificationFormData>();

  const onSubmit = async (data: NotificationFormData) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error("משתמש לא מחובר");
      }

      const { error } = await supabase.from("notifications").insert({
        sender_id: session.session.user.id,
        message: data.message,
        scheduled_for: data.scheduledFor.toISOString(),
        condition: data.condition ? JSON.parse(data.condition) : null,
        recipient_id: data.recipientId || null,
        type: "custom",
        status: "pending"
      });

      if (error) throw error;

      toast.success("התזכורת נוצרה בהצלחה");
      form.reset();
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("שגיאה ביצירת התזכורת");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <FormField
          control={form.control}
          name="scheduledFor"
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
                          setDate(date);
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

        <FormField
          control={form.control}
          name="recipientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מזהה נמען (אופציונלי)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="הכנס מזהה נמען..." />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תנאי שליחה (JSON, אופציונלי)</FormLabel>
              <FormControl>
                <Input {...field} placeholder='{"key": "value"}' />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">צור תזכורת</Button>
      </form>
    </Form>
  );
};