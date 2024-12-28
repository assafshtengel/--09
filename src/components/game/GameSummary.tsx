import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Action } from "@/components/ActionSelector";
import { GameStats } from "./GameStats";
import { GameInsights } from "./GameInsights";
import { GoalsAchievement } from "./GoalsAchievement";
import { PerformanceTable } from "./PerformanceTable";
import { SummaryHeader } from "./summary/SummaryHeader";
import { QuestionsSection } from "./summary/QuestionsSection";
import { NotesSection } from "./summary/NotesSection";
import { ActionsLogSection } from "./summary/ActionsLogSection";
import { SummaryActions } from "./summary/SummaryActions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
}

export const GameSummary = ({ 
  actions, 
  actionLogs, 
  generalNotes,
  substitutions,
  onClose,
  gamePhase = "ended",
  onContinueGame,
  matchId
}: GameSummaryProps) => {
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [performanceRatings, setPerformanceRatings] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const handleAnswerChange = (question: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const handlePerformanceRating = (aspect: string, rating: number) => {
    setPerformanceRatings(prev => ({
      ...prev,
      [aspect]: rating
    }));
  };

  const calculateScore = (actionLogs: ActionLog[]) => {
    const successPoints = 10;
    const failurePoints = -5;
    
    const score = actionLogs.reduce((total, log) => {
      return total + (log.result === "success" ? successPoints : failurePoints);
    }, 0);

    return Math.max(0, score);
  };

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

      const { error: feedbackError } = await supabase
        .from('post_game_feedback')
        .insert([
          {
            player_id: user.id,
            match_id: matchId,
            questions_answers: answers,
            performance_ratings: performanceRatings,
          }
        ]);

      if (feedbackError) throw feedbackError;

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

      const htmlContent = `
        <div dir="rtl">
          <h1>סיכום משחק</h1>
          ${document.getElementById('game-summary-content')?.innerHTML}
        </div>
      `;

      const { error } = await supabase.functions.invoke('send-game-summary', {
        body: {
          to: [user.email],
          subject: `סיכום משחק - ${format(new Date(), 'dd/MM/yyyy')}`,
          html: htmlContent,
        },
      });

      if (error) throw error;
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

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6 p-4 bg-background">
        <div id="game-summary-content">
          <SummaryHeader gamePhase={gamePhase} />
          
          {/* Goals Achievement Section */}
          <GoalsAchievement actions={actions} actionLogs={actionLogs} />

          {/* Post Game Questions */}
          {gamePhase === "ended" && (
            <QuestionsSection
              answers={answers}
              onAnswerChange={handleAnswerChange}
            />
          )}

          {/* Performance Ratings */}
          {gamePhase === "ended" && (
            <PerformanceTable
              ratings={performanceRatings}
              onRatingChange={handlePerformanceRating}
            />
          )}

          {/* General Notes */}
          <NotesSection notes={generalNotes} />

          {/* Overall Stats */}
          <div className="mt-6">
            <GameStats actions={actions} actionLogs={actionLogs} />
          </div>

          {/* Game Insights */}
          <div className="mt-6">
            <GameInsights actionLogs={actionLogs} />
          </div>

          {/* Score */}
          <div className="p-4 border rounded-lg bg-primary/10 mt-6">
            <h3 className="text-xl font-semibold text-right mb-2">ציון</h3>
            <p className="text-3xl font-bold text-center">{calculateScore(actionLogs)}</p>
          </div>

          {/* Action Logs */}
          <ActionsLogSection actions={actions} actionLogs={actionLogs} />
        </div>

        {/* Actions */}
        <SummaryActions
          gamePhase={gamePhase}
          isSendingEmail={isSendingEmail}
          onSubmit={handleSubmit}
          onSendEmail={sendEmail}
          onShareSocial={shareToSocial}
          onScreenshot={takeScreenshot}
          onClose={onClose}
          onContinueGame={onContinueGame}
        />
      </div>
    </ScrollArea>
  );
};