import React, { useState } from 'react';
import { Action } from "@/components/ActionSelector";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { GameStats } from "./GameStats";
import { GameInsights } from "./GameInsights";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostGameQuestions } from "./PostGameQuestions";
import { PerformanceTable } from "./PerformanceTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

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
  matchId?: string; // Add matchId to props
}

export const GameSummary = ({ 
  actions, 
  actionLogs, 
  generalNotes,
  substitutions,
  onClose,
  gamePhase,
  onContinueGame,
  matchId
}: GameSummaryProps) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [performanceRatings, setPerformanceRatings] = useState<Record<string, number>>({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast: showToast } = useToast();

  const calculateScore = (actionLogs: ActionLog[]) => {
    const successPoints = 10;
    const failurePoints = -5;
    
    const score = actionLogs.reduce((total, log) => {
      return total + (log.result === "success" ? successPoints : failurePoints);
    }, 0);

    return Math.max(0, score);
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
        showToast({
          title: "צילום מסך נשמר בהצלחה",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error taking screenshot:', error);
      showToast({
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
      showToast({
        title: "טקסט הועק ללוח",
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
      showToast({
        title: "הסיכום נשלח בהצלחה למייל",
        variant: "default",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      showToast({
        title: "שגיאה בשליחת המייל",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleQuestionSubmit = async (answers: Record<string, string | number>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Save feedback to database
      const { error } = await supabase
        .from('post_game_feedback')
        .insert([
          {
            player_id: user.id,
            match_id: matchId,
            questions_answers: answers,
            performance_ratings: performanceRatings,
          }
        ]);

      if (error) throw error;

      // Send email with feedback
      await sendEmail();
      
      setShowQuestions(false);
      showToast({
        title: "המשוב נשמר בהצלחה",
        description: "סיכום המשחק נשלח למייל",
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
      showToast({
        title: "שגיאה בשמירת המשוב",
        variant: "destructive",
      });
    }
  };

  const handlePerformanceRating = (aspect: string, rating: number) => {
    setPerformanceRatings(prev => ({
      ...prev,
      [aspect]: rating
    }));
  };

  if (showQuestions) {
    return (
      <PostGameQuestions onSubmit={handleQuestionSubmit} />
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6 p-4 bg-background">
        <div id="game-summary-content">
          {/* Header */}
          <div className="text-right border-b pb-4">
            <h2 className="text-2xl font-bold mb-2">
              {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
            </h2>
            <p className="text-muted-foreground">
              {format(new Date(), 'dd/MM/yyyy')}
            </p>
          </div>

          {/* Initial Goals */}
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-right">יעדי המשחק</h3>
            <div className="grid gap-3">
              {actions.map(action => (
                <div key={action.id} className="border p-3 rounded-lg text-right">
                  <h4 className="font-medium">{action.name}</h4>
                  {action.goal && (
                    <p className="text-sm text-muted-foreground">יעד: {action.goal}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* General Notes */}
          {generalNotes.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-semibold text-right">הערות כלליות</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">דקה</TableHead>
                    <TableHead className="text-right">הערה</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generalNotes.map((note, index) => (
                    <TableRow key={index}>
                      <TableCell>{note.minute}'</TableCell>
                      <TableCell className="text-right">{note.text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

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

          {/* Action Logs Table */}
          <div className="space-y-4 mt-6">
            <h3 className="text-xl font-semibold text-right">פעולות</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">דקה</TableHead>
                  <TableHead className="text-right">פעולה</TableHead>
                  <TableHead className="text-right">תוצאה</TableHead>
                  <TableHead className="text-right">הערה</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.minute}'</TableCell>
                    <TableCell className="text-right">
                      {actions.find(a => a.id === log.actionId)?.name}
                    </TableCell>
                    <TableCell>
                      {log.result === "success" ? "✅" : "❌"}
                    </TableCell>
                    <TableCell className="text-right">{log.note || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PerformanceTable
            ratings={performanceRatings}
            onRatingChange={handlePerformanceRating}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-4">
          {gamePhase === "halftime" && onContinueGame && (
            <Button onClick={() => {
              onContinueGame();
              onClose();
            }} variant="default">
              המשך למחצית שנייה
            </Button>
          )}
          
          {gamePhase === "ended" && (
            <>
              <Button onClick={() => setShowQuestions(true)} variant="default">
                המשך לשאלון
              </Button>
              <Button 
                onClick={sendEmail} 
                variant="outline"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? "שולח..." : "שלח למייל"}
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => shareToSocial('facebook')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  שתף בפייסבוק
                </Button>
                <Button
                  onClick={() => shareToSocial('instagram')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  שתף באינסטגרם
                </Button>
              </div>
            </>
          )}
          
          <Button onClick={takeScreenshot} variant="outline">
            שמור צילום מסך
          </Button>
          <Button onClick={onClose} variant="outline">
            סגור
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};
