import { useState, useEffect } from 'react';
import { Action } from "@/components/ActionSelector";
import { GameStats } from "./GameStats";
import { GameInsights } from "./GameInsights";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

interface GameSummaryProps {
  actions: Action[];
  actionLogs: ActionLog[];
  generalNotes: Array<{ text: string; minute: number }>;
  onClose: () => void;
  gamePhase: "halftime" | "ended";
  matchId?: string;
}

export const GameSummary = ({
  actions,
  actionLogs,
  generalNotes,
  onClose,
  gamePhase,
  matchId
}: GameSummaryProps) => {
  const [havaya, setHavaya] = useState<string[]>([]);
  const [preMatchAnswers, setPreMatchAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (matchId) {
      loadPreMatchData();
    }
  }, [matchId]);

  const loadPreMatchData = async () => {
    try {
      const { data: match } = await supabase
        .from('matches')
        .select(`
          pre_match_reports (
            havaya,
            questions_answers
          )
        `)
        .eq('id', matchId)
        .single();

      if (match?.pre_match_reports) {
        const report = match.pre_match_reports;
        if (report.havaya) {
          setHavaya(report.havaya.split(','));
        }
        if (report.questions_answers && typeof report.questions_answers === 'object') {
          setPreMatchAnswers(report.questions_answers as Record<string, string>);
        }
      }
    } catch (error) {
      console.error('Error loading pre-match data:', error);
    }
  };

  const calculateActionStats = (actionId: string) => {
    const actionResults = actionLogs.filter(log => log.actionId === actionId);
    const successes = actionResults.filter(log => log.result === "success").length;
    return `${successes}/${actionResults.length}`;
  };

  const handleClose = () => {
    if (gamePhase === "halftime") {
      onClose(); // This will return to game tracking
    }
  };

  return (
    <ScrollArea className="h-[80vh] md:h-[600px] p-4">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-right">
            {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
          </h2>
        </div>

        {havaya.length > 0 && (
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-right">הוויות נבחרות</h3>
            <div className="flex flex-wrap gap-2 justify-end">
              {havaya.map((h, index) => (
                <Badge key={index} variant="secondary">
                  {h}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {Object.keys(preMatchAnswers).length > 0 && (
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-right">תשובות מדוח טרום משחק</h3>
            <div className="space-y-2">
              {Object.entries(preMatchAnswers).map(([question, answer], index) => (
                <div key={index} className="text-right">
                  <p className="font-medium">{question}</p>
                  <p className="text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-right">פעולות במשחק</h3>
          {actions.map(action => (
            <div key={action.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{calculateActionStats(action.id)}</span>
                <span>{action.name}</span>
              </div>
            </div>
          ))}
        </div>

        {gamePhase === "halftime" && (
          <>
            <GameInsights actionLogs={actionLogs} />
            
            {generalNotes.length > 0 && (
              <div className="border p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-right">הערות</h3>
                <div className="space-y-2">
                  {generalNotes.map((note, index) => (
                    <div key={index} className="text-right">
                      <span className="text-sm text-muted-foreground">{note.minute}'</span>
                      <p>{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
};