import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { GameInsights } from "../GameInsights";
import { GoalsAchievement } from "../GoalsAchievement";
import { PerformanceTable } from "../PerformanceTable";
import { QuestionsSection } from "./QuestionsSection";
import { NotesSection } from "./NotesSection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

interface SummaryContentProps {
  actions: Action[];
  actionLogs: ActionLog[];
  generalNotes: Array<{ text: string; minute: number }>;
  gamePhase: "halftime" | "ended";
}

export const SummaryContent = ({
  actions,
  actionLogs,
  generalNotes,
  gamePhase
}: SummaryContentProps) => {
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

  const calculateActionStats = (action: Action) => {
    const actionAttempts = actionLogs.filter(log => log.actionId === action.id);
    const successCount = actionAttempts.filter(log => log.result === "success").length;
    const totalAttempts = actionAttempts.length;
    
    return {
      successCount,
      totalAttempts,
      successRate: totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0
    };
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-right">יעדי המשחק</h3>
        <div className="space-y-4">
          {actions.map(action => {
            const stats = calculateActionStats(action);
            return (
              <div key={action.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    {stats.successCount}/{stats.totalAttempts} הצלחות
                  </span>
                  <span className="font-medium">{action.name}</span>
                </div>
                <Progress 
                  value={stats.successRate} 
                  className="h-2 mb-2" 
                />
                {action.goal && (
                  <div className="text-sm text-right text-muted-foreground">
                    יעד: {action.goal}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {gamePhase === "ended" && (
        <>
          <div className="mt-6">
            <QuestionsSection
              answers={answers}
              onAnswerChange={handleAnswerChange}
            />
          </div>

          <div className="mt-6">
            <PerformanceTable
              ratings={performanceRatings}
              onRatingChange={handlePerformanceRating}
            />
          </div>
        </>
      )}

      <div className="mt-6">
        <NotesSection notes={generalNotes} />
      </div>

      <div className="mt-6">
        <GameInsights actionLogs={actionLogs} />
      </div>

      <div className="p-4 border rounded-lg bg-primary/10 mt-6">
        <h3 className="text-lg md:text-xl font-semibold text-right mb-2">ציון</h3>
        <p className="text-2xl md:text-3xl font-bold text-center">
          {calculateScore(actionLogs)}
        </p>
      </div>
    </div>
  );
};