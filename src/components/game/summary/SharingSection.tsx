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

  const handleSaveData = async () => {
    if (!matchId) return;
    
    setIsSaving(true);
    setSaveTimer(30);
    
    try {
      console.log('Starting data save process...'); 

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // First check if feedback exists
      const { data: existingFeedback, error: fetchError } = await supabase
        .from('post_game_feedback')
        .select('*')
        .eq('match_id', matchId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw fetchError;
      }

      const feedbackData = {
        match_id: matchId,
        player_id: user.id,
        match_stats: existingFeedback?.match_stats || {},
        performance_ratings: existingFeedback?.performance_ratings || {},
        questions_answers: existingFeedback?.questions_answers || {},
        goal_progress: existingFeedback?.goal_progress || {},
        havaya_ratings: existingFeedback?.havaya_ratings || {}
      };

      let error;
      if (existingFeedback) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('post_game_feedback')
          .update(feedbackData)
          .eq('match_id', matchId);
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('post_game_feedback')
          .insert(feedbackData);
        error = insertError;
      }

      if (error) throw error;

      console.log('Feedback saved successfully');

      // Update match status
      const { error: updateError } = await supabase
        .from('matches')
        .update({ status: 'completed' })
        .eq('id', matchId);

      if (updateError) {
        throw updateError;
      }

      console.log('Match status updated successfully');

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