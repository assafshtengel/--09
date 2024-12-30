import { Button } from "@/components/ui/button";
import { Printer, Copy, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ScheduleHeaderProps {
  onPrint: () => void;
  onCopyLastWeek: () => Promise<void>;
}

export const ScheduleHeader = ({ onPrint, onCopyLastWeek }: ScheduleHeaderProps) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const handleWhatsAppShare = async () => {
    try {
      setIsSending(true);
      
      // Get user's profile to get coach's phone number
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("משתמש לא מחובר");

      const { data: profile } = await supabase
        .from('profiles')
        .select('coach_phone_number')
        .eq('id', user.id)
        .single();

      if (!profile?.coach_phone_number) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מספר טלפון של המאמן בפרופיל",
          variant: "destructive",
        });
        return;
      }

      // Get current week's schedule
      const { data: schedule } = await supabase
        .from('weekly_schedules')
        .select(`
          start_date,
          schedule_activities (
            activity_type,
            day_of_week,
            start_time,
            end_time,
            title
          )
        `)
        .eq('player_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!schedule) throw new Error("לא נמצא סדר שבוע");

      const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
      
      const scheduleText = `סדר שבוע החל מ-${schedule.start_date}\n\n` +
        schedule.schedule_activities
          .sort((a: any, b: any) => a.day_of_week - b.day_of_week)
          .reduce((acc: string, activity: any) => {
            return acc + `${days[activity.day_of_week]}: ${activity.title || activity.activity_type} ` +
              `(${activity.start_time.slice(0, 5)}-${activity.end_time.slice(0, 5)})\n`;
          }, "");

      const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          message: scheduleText,
          recipientNumber: profile.coach_phone_number
        }
      });

      if (whatsappError) throw whatsappError;

      toast({
        title: "נשלח בהצלחה",
        description: "סדר השבוע נשלח למאמן",
      });

    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: "לא הצלחנו לשלוח את ההודעה למאמן",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6 print:hidden">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="h-4 w-4 ml-2" />
          הדפס
        </Button>
        <Button variant="outline" size="sm" onClick={onCopyLastWeek}>
          <Copy className="h-4 w-4 ml-2" />
          העתק משבוע שעבר
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleWhatsAppShare}
          disabled={isSending}
        >
          <Send className="h-4 w-4 ml-2" />
          {isSending ? "שולח..." : "שלח למאמן"}
        </Button>
      </div>
      <h2 className="text-xl font-semibold">סדר שבוע</h2>
    </div>
  );
};