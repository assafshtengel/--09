import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Mail, Instagram, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SharingSectionProps {
  onEmailSend: (type: 'user' | 'coach') => void;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  isSendingEmail: boolean;
  actions: any[];
  actionLogs: any[];
  insights: string;
  matchId?: string;
  opponent: string | null;
  matchDate: string;
  onCaptionClose: () => void;
}

export const SharingSection = ({
  onEmailSend,
  onShareSocial,
  isSendingEmail,
  actions,
  actionLogs,
  insights,
  matchId,
  opponent,
  matchDate,
  onCaptionClose,
}: SharingSectionProps) => {
  const { toast } = useToast();
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveData = async () => {
    if (!matchId) return;
    
    setIsSaving(true);
    try {
      // Update match status to indicate data has been saved
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status: 'completed' })
        .eq('id', matchId);

      if (updateError) throw updateError;

      setIsDataSaved(true);
      toast({
        title: "נתוני המשחק נשמרו בהצלחה",
        description: "כעת תוכל לשתף את הסיכום",
      });
    } catch (error) {
      console.error('Error saving match data:', error);
      toast({
        title: "שגיאה בשמירת הנתונים",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 mt-6 border-t pt-4">
      {!isDataSaved ? (
        <div className="flex justify-center">
          <Button
            onClick={handleSaveData}
            className="w-48 gap-2 text-lg"
            disabled={isSaving}
          >
            <Save className="h-5 w-5" />
            {isSaving ? "שומר..." : "שמור נתונים"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => onEmailSend('user')}
              variant="outline"
              className="gap-2"
              disabled={isSendingEmail}
            >
              <Mail className="h-4 w-4" />
              {isSendingEmail ? "שולח..." : "שלח למייל"}
            </Button>
            
            <Button
              onClick={() => onEmailSend('coach')}
              variant="outline"
              className="gap-2"
              disabled={isSendingEmail}
            >
              <Mail className="h-4 w-4" />
              {isSendingEmail ? "שולח..." : "שלח למאמן"}
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => onShareSocial('instagram')}
              variant="outline"
              className="gap-2"
            >
              <Instagram className="h-4 w-4" />
              שתף באינסטגרם
            </Button>
            
            <Button
              onClick={() => onShareSocial('facebook')}
              variant="outline"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              שתף בפייסבוק
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};