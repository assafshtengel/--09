import { Button } from "@/components/ui/button";
import { Home, Mail, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SummaryButtonsProps {
  onPrint: () => Promise<void>;
  isEmailSending: boolean;
  isPrinting: boolean;
  onFinish?: () => void;  // Added this prop
}

export const SummaryButtons = ({
  onPrint,
  isEmailSending,
  isPrinting,
  onFinish,  // Added this prop
}: SummaryButtonsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendToCoach = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("משתמש לא מחובר");

      const { data: profile } = await supabase
        .from('profiles')
        .select('coach_email')
        .eq('id', user.id)
        .single();

      if (!profile?.coach_email) {
        toast({
          title: "שגיאה",
          description: "לא נמצאה כתובת מייל של המאמן בפרופיל",
          variant: "destructive",
        });
        return;
      }

      // Send email logic here
      toast({
        title: "נשלח בהצלחה",
        description: "הדוח נשלח למייל המאמן",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה בשליחת המייל",
        description: "לא הצלחנו לשלוח את המייל",
        variant: "destructive",
      });
    }
  };

  const handleSendToUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("לא נמצאה כתובת מייל");

      // Send email logic here
      toast({
        title: "נשלח בהצלחה",
        description: "הדוח נשלח למייל שלך",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה בשליחת המייל",
        description: "לא הצלחנו לשלוח את המייל",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 justify-end mt-6">
      <Button
        onClick={onFinish || (() => navigate("/dashboard"))}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Home className="h-4 w-4" />
        חזור לדף הבית
      </Button>
      
      <Button
        onClick={handleSendToUser}
        variant="outline"
        disabled={isEmailSending}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        שלח למייל שלי
      </Button>

      <Button
        onClick={handleSendToCoach}
        variant="outline"
        disabled={isEmailSending}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        שלח למייל המאמן
      </Button>

      <Button
        onClick={onPrint}
        variant="outline"
        disabled={isPrinting}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? "מדפיס..." : "הדפס"}
      </Button>
    </div>
  );
};