import { useState } from 'react';
import { Action } from "@/components/ActionSelector";
import { SummaryLayout } from "./summary/SummaryLayout";
import { StatisticsSection } from "./summary/StatisticsSection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import { format } from "date-fns";

interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

interface GameSummaryProps {
  actions: Action[];
  actionLogs: ActionLog[];
  generalNotes: Array<{ text: string; minute: number }>;
  substitutions: SubstitutionLog[];
  onClose: () => void;
  gamePhase?: "halftime" | "ended";
  onContinueGame?: () => void;
  matchId?: string;
  opponent?: string;
}

export const GameSummary = ({ 
  actions, 
  actionLogs, 
  generalNotes,
  substitutions,
  onClose,
  gamePhase = "ended",
  onContinueGame,
  matchId,
  opponent
}: GameSummaryProps) => {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "שגיאה",
          description: "משתמש לא מחובר",
          variant: "destructive",
        });
        return;
      }

      if (!matchId) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מזהה משחק",
          variant: "destructive",
        });
        return;
      }

      await sendEmail();
      toast({
        title: "המשוב נשמר בהצלחה",
        description: "סיכום המשחק נשלח למייל",
      });
      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "שגיאה בשמירת המשוב",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const takeScreenshot = async () => {
    try {
      const element = document.getElementById('game-summary-content');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `game-summary-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "צילום מסך נשמר בהצלחה",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast({
        title: "שגיאה בשמירת צילום המסך",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = async (platform: 'facebook' | 'instagram') => {
    const score = calculateScore(actionLogs);
    const shareText = `Just finished a game with a performance score of ${score}! 🎯⚽️ #SoccerPerformance #Training`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodeURIComponent(shareText)}`, '_blank');
    } else if (platform === 'instagram') {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "טקסט הועתק ללוח",
        description: "כעת תוכל להדביק אותו באינסטגרם",
      });
    }
  };

  const sendEmail = async () => {
    try {
      setIsSendingEmail(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      // Get performance ratings from the post_game_feedback table
      const { data: feedback, error } = await supabase
        .from('post_game_feedback')
        .select('performance_ratings')
        .eq('match_id', matchId)
        .maybeSingle();  // Changed from single() to maybeSingle()

      const performanceRatings = feedback?.performance_ratings || {};

      // Create the performance ratings table HTML
      const ratingsTableHTML = `
        <div style="margin-top: 20px; margin-bottom: 20px;">
          <h3 style="text-align: right;">ציוני ביצוע</h3>
          <table style="width: 100%; border-collapse: collapse; direction: rtl;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">נושא</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">ציון</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(performanceRatings).map(([aspect, rating]) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${aspect}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${rating}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      const htmlContent = `
        <div dir="rtl">
          <h1>סיכום משחק</h1>
          ${document.getElementById('game-summary-content')?.innerHTML || ''}
          ${ratingsTableHTML}
        </div>
      `;

      const { error: emailError } = await supabase.functions.invoke('send-game-summary', {
        body: {
          to: [user.email],
          subject: `סיכום משחק - ${format(new Date(), 'dd/MM/yyyy')}`,
          html: htmlContent,
        },
      });

      if (emailError) throw emailError;
      toast({
        title: "הסיכום נשלח בהצלחה למייל",
        variant: "default",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה בשליחת המייל",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const calculateScore = (actionLogs: ActionLog[]) => {
    const successPoints = 10;
    const failurePoints = -5;
    
    const score = actionLogs.reduce((total, log) => {
      return total + (log.result === "success" ? successPoints : failurePoints);
    }, 0);

    return Math.max(0, score);
  };

  return (
    <SummaryLayout
      actions={actions}
      actionLogs={actionLogs}
      generalNotes={generalNotes}
      substitutions={substitutions}
      onClose={onClose}
      gamePhase={gamePhase}
      onContinueGame={onContinueGame}
      matchId={matchId}
      isSendingEmail={isSendingEmail}
      onSubmit={handleSubmit}
      onSendEmail={sendEmail}
      onShareSocial={shareToSocial}
      onScreenshot={takeScreenshot}
      opponent={opponent}
    >
      <StatisticsSection actions={actions} actionLogs={actionLogs} />
    </SummaryLayout>
  );
};
