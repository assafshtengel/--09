import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { format } from "date-fns";
import { CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationFormData {
  message: string;
  scheduledFor: Date;
  condition?: string;
  recipients: string[];
}

type NotificationType = "pre_match" | "weekly" | "mental_tip" | "custom";
type NotificationStatus = "pending" | "sent" | "failed";

interface Player {
  id: string;
  full_name: string;
  club?: string;
}

export const NotificationForm = () => {
  const [date, setDate] = useState<Date>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const form = useForm<NotificationFormData>();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, club')
        .eq('role', 'player');
      
      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error("שגיאה בטעינת רשימת השחקנים");
    }
  };

  const onSubmit = async (data: NotificationFormData) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error("משתמש לא מחובר");
      }

      // אם נבחרו שחקנים, שלח התראה לכל אחד מהם
      if (selectedPlayers.length > 0) {
        const notifications = selectedPlayers.map(playerId => ({
          sender_id: session.session.user.id,
          message: data.message,
          scheduled_for: data.scheduledFor.toISOString(),
          condition: data.condition ? JSON.parse(data.condition) : null,
          recipient_id: playerId,
          type: "custom" as NotificationType,
          status: "pending" as NotificationStatus
        }));

        const { error } = await supabase
          .from("notifications")
          .insert(notifications);
          
        if (error) throw error;
      } else {
        // אם לא נבחרו שחקנים, שלח התראה גלובלית
        const { error } = await supabase
          .from("notifications")
          .insert({
            sender_id: session.session.user.id,
            message: data.message,
            scheduled_for: data.scheduledFor.toISOString(),
            condition: data.condition ? JSON.parse(data.condition) : null,
            recipient_id: null,
            type: "custom" as NotificationType,
            status: "pending" as NotificationStatus
          });
        if (error) throw error;
      }

      toast.success("התזכורת נוצרה בהצלחה");
      form.reset();
      setSelectedPlayers([]);
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

        <FormItem>
          <FormLabel>בחר שחקנים (אופציונלי)</FormLabel>
          <Command className="border rounded-md">
            <CommandInput placeholder="חפש שחקנים..." />
            <CommandEmpty>לא נמצאו שחקנים</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  onSelect={() => {
                    setSelectedPlayers(prev => {
                      if (prev.includes(player.id)) {
                        return prev.filter(id => id !== player.id);
                      }
                      return [...prev, player.id];
                    });
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPlayers.includes(player.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{player.full_name}</span>
                  {player.club && <span className="text-muted-foreground mr-2">({player.club})</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </FormItem>

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