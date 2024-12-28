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
import { toast } from "sonner";
import { GameStats } from "./GameStats";
import { GameInsights } from "./GameInsights";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PostGameQuestions } from "./PostGameQuestions";
import { PerformanceTable } from "./PerformanceTable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

const calculateScore = (actionLogs: ActionLog[]) => {
  const successPoints = 10;
  const failurePoints = -5;
  
  const score = actionLogs.reduce((total, log) => {
    return total + (log.result === "success" ? successPoints : failurePoints);
  }, 0);

  return Math.max(0, score); // Score cannot be negative
};

export const GameSummary = ({ 
  actions, 
  actionLogs, 
  generalNotes,
  substitutions,
  onClose,
  gamePhase,
  onContinueGame
}: GameSummaryProps) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [performanceRatings, setPerformanceRatings] = useState<Record<string, number>>({});
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();

  const takeScreenshot = async () => {
    try {
      const element = document.getElementById('game-summary-content');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `game-summary-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success("צילום מסך נשמר בהצלחה");
      }
    } catch (error) {
      toast.error("שגיאה בשמירת צילום המסך");
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
      toast.success("הסיכום נשלח בהצלחה למייל");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("שגיאה בשליחת המייל");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleQuestionSubmit = (answers: Record<string, string | number>) => {
    // Here you would typically save the answers to your database
    setShowQuestions(false);
    // Continue with the regular summary view
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

        <div className="flex justify-end gap-4">
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
