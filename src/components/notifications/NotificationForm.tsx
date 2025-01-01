import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NotificationMessage } from "./form/NotificationMessage";
import { NotificationSchedule } from "./form/NotificationSchedule";
import { RecipientSelector } from "./form/RecipientSelector";
import { NotificationData } from "@/types/notifications";

export const NotificationForm = () => {
  const [isSending, setIsSending] = useState(false);
  const form = useForm<NotificationData>({
    defaultValues: {
      message: "",
      scheduled_for: "",
      recipient_id: "",
      type: "custom",
      status: "pending"
    }
  });

  const onSubmit = async (data: NotificationData) => {
    try {
      setIsSending(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error("משתמש לא מחובר");
      }

      const notifications = data.recipient_id ? [{
        sender_id: session.session.user.id,
        message: data.message,
        scheduled_for: data.scheduled_for,
        condition: data.condition ? JSON.stringify(data.condition) : null,
        recipient_id: data.recipient_id,
        type: data.type,
        status: "pending"
      }] : [{
        sender_id: session.session.user.id,
        message: data.message,
        scheduled_for: data.scheduled_for,
        condition: data.condition ? JSON.stringify(data.condition) : null,
        recipient_id: null,
        type: data.type,
        status: "pending"
      }];

      const { error } = await supabase.from("notifications").insert(notifications);
      if (error) throw error;

      toast.success("התזכורת נוצרה בהצלחה");
      form.reset();
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("שגיאה ביצירת התזכורת");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <NotificationMessage form={form} />
        <NotificationSchedule form={form} />
        <FormField
          control={form.control}
          name="recipient_id"
          render={() => (
            <FormItem>
              <FormLabel>נמען</FormLabel>
              <FormControl>
                <RecipientSelector form={form} />
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
                <Input 
                  {...field} 
                  value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      field.onChange(parsed);
                    } catch {
                      field.onChange(e.target.value);
                    }
                  }}
                  placeholder='{"key": "value"}'
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSending}>
          {isSending ? "שולח..." : "צור תזכורת"}
        </Button>
      </form>
    </Form>
  );
};