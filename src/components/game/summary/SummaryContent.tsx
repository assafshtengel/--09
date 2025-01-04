import { useState } from "react";
import { Action } from "@/components/ActionSelector";
import { GameInsights } from "../GameInsights";
import { GoalsAchievement } from "../GoalsAchievement";
import { PerformanceTable } from "../PerformanceTable";
import { QuestionsSection } from "./QuestionsSection";
import { NotesSection } from "./NotesSection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <div className="space-y-6">
      <div className="mt-4">
        <GoalsAchievement actions={actions} actionLogs={actionLogs} />
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