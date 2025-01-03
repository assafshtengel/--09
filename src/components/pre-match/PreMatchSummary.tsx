import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PreMatchSummaryProps {
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
  };
  actions: Action[];
  answers: Record<string, string>;
  havaya: string;
  aiInsights: string[];
  onFinish: () => void;
}

export const PreMatchSummary = ({
  matchDetails,
  actions,
  answers,
  havaya,
  aiInsights,
  onFinish,
}: PreMatchSummaryProps) => {
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

      const summaryText = `דוח טרום משחק - ${matchDetails.date}${matchDetails.opponent ? ` מול ${matchDetails.opponent}` : ''}\n\n` +
        `הוויה נבחרת: ${havaya}\n\n` +
        `יעדים למשחק:\n${actions.map(action => 
          `- ${action.name}${action.goal ? ` (יעד: ${action.goal})` : ''}`
        ).join('\n')}\n\n` +
        `תשובות לשאלות:\n${Object.entries(answers)
          .map(([question, answer]) => `${question}: ${answer}`).join('\n')}`;

      const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          message: summaryText,
          recipientNumber: profile.coach_phone_number
        }
      });

      if (whatsappError) throw whatsappError;

      toast({
        title: "נשלח בהצלחה",
        description: "דוח טרום משחק נשלח למאמן",
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
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">סיכום דוח טרום משחק</h2>
        <p className="text-muted-foreground">
          תאריך: {matchDetails.date}
          {matchDetails.opponent && ` | נגד: ${matchDetails.opponent}`}
        </p>
      </div>

      {havaya && (
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">הוויה נבחרת</h3>
          <p className="text-xl font-bold">{havaya}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">יעדים למשחק</h3>
        <ul className="space-y-2">
          {actions.map((action, index) => (
            <li key={index} className="border p-2 rounded">
              {action.name}
              {action.goal && <div className="text-sm">יעד: {action.goal}</div>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">תשובות לשאלות</h3>
        <div className="space-y-4">
          {Object.entries(answers).map(([question, answer], index) => (
            <div key={index} className="border p-3 rounded">
              <p className="font-medium">{question}</p>
              <p className="text-muted-foreground">{answer}</p>
            </div>
          ))}
        </div>
      </div>

      {aiInsights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">תובנות AI</h3>
          <ul className="space-y-2">
            {aiInsights.map((insight, index) => (
              <li key={index} className="text-muted-foreground">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button 
          onClick={handleWhatsAppShare}
          variant="outline"
          disabled={isSending}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSending ? "שולח..." : "שלח למאמן"}
        </Button>
        <Button onClick={onFinish}>סיים</Button>
      </div>
    </div>
  );
};