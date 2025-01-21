import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Mail, Instagram, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PostGameFeedback {
  match_stats?: {
    finalScore?: string;
    winner?: string;
    goalsScored?: number;
    assists?: number;
  };
  goal_progress?: {
    progressRating?: number;
    shortTermGoal?: string;
    actionsPerformed?: number;
    progressNotes?: string;
  };
  performance_ratings?: Record<string, number>;
  questions_answers?: Record<string, any>;
  havaya_ratings?: Record<string, number>;
}

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
  const [saveTimer, setSaveTimer] = useState(30);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSaving && saveTimer > 0) {
      interval = setInterval(() => {
        setSaveTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSaving, saveTimer]);

  const validateData = async () => {
    const errors: string[] = [];
    
    if (!matchId) {
      errors.push("לא נמצא מזהה משחק");
      return errors;
    }

    // Check if post game feedback exists
    const { data: feedback, error } = await supabase
      .from('post_game_feedback')
      .select('match_stats, goal_progress')
      .eq('match_id', matchId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching feedback:', error);
      return ['שגיאה בטעינת נתוני המשחק'];
    }

    const typedFeedback = feedback as PostGameFeedback;
    console.log('Validating feedback data:', typedFeedback); // Debug log

    // Check match stats
    if (!typedFeedback?.match_stats?.finalScore) {
      errors.push("יש למלא את תוצאת המשחק");
    }

    if (!typedFeedback?.match_stats?.winner) {
      errors.push("יש לציין את הקבוצה המנצחת");
    }

    // Check goal progress
    if (!typedFeedback?.goal_progress?.progressRating) {
      errors.push("יש לדרג את ההתקדמות ביעד האישי");
    }

    return errors;
  };

  const handleSaveData = async () => {
    if (!matchId) return;
    
    setIsSaving(true);
    setSaveTimer(30);
    
    try {
      // First validate the data
      const errors = await validateData();
      if (errors.length > 0) {
        setValidationErrors(errors);
        errors.forEach(error => {
          toast({
            title: "שגיאה בשמירת נתונים",
            description: error,
            variant: "destructive",
          });
        });
        setIsSaving(false);
        return;
      }

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
      setSaveTimer(30);
    }
  };

  return (
    <div className="space-y-4 mt-6 border-t pt-4">
      {!isDataSaved ? (
        <div className="flex flex-col items-center gap-4">
          {validationErrors.length > 0 && (
            <div className="text-red-500 text-right w-full space-y-1">
              {validationErrors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          <Button
            onClick={handleSaveData}
            className="w-48 gap-2 text-lg"
            disabled={isSaving}
          >
            <Save className="h-5 w-5" />
            {isSaving ? `שומר... (${saveTimer}s)` : "שמור נתונים"}
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