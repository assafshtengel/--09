import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import { Action } from "@/components/ActionSelector";

interface GameTrackerProps {
  actions: Action[];
}

type GamePhase = "preview" | "playing" | "halftime" | "secondHalf" | "ended";
type ActionResult = "success" | "failure";

interface ActionLog {
  actionId: string;
  minute: number;
  result: ActionResult;
  note?: string;
}

export const GameTracker = ({ actions }: GameTrackerProps) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>("preview");
  const [minute, setMinute] = useState(0);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const startMatch = () => {
    setGamePhase("playing");
    const interval = setInterval(() => {
      setMinute(prev => prev + 1);
    }, 60000); // Update every minute
    setTimerInterval(Number(interval));
  };

  const endHalf = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setGamePhase("halftime");
    setShowSummary(true);
  };

  const startSecondHalf = () => {
    setGamePhase("secondHalf");
    setMinute(45);
    const interval = setInterval(() => {
      setMinute(prev => prev + 1);
    }, 60000);
    setTimerInterval(Number(interval));
    setShowSummary(false);
  };

  const endMatch = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setGamePhase("ended");
    setShowSummary(true);
  };

  const logAction = (actionId: string, result: ActionResult, note?: string) => {
    setActionLogs(prev => [...prev, {
      actionId,
      minute,
      result,
      note
    }]);
  };

  const takeScreenshot = async () => {
    try {
      const element = document.getElementById('goals-preview');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = 'game-goals.png';
        link.href = canvas.toDataURL();
        link.click();
        toast({
          title: "צילום מסך הושלם",
          description: "התמונה נשמרה בהצלחה",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לצלם את המסך",
        variant: "destructive",
      });
    }
  };

  const calculateStats = () => {
    const stats = actions.map(action => {
      const actionResults = actionLogs.filter(log => log.actionId === action.id);
      const successes = actionResults.filter(log => log.result === "success").length;
      const failures = actionResults.filter(log => log.result === "failure").length;
      const total = successes + failures;
      const successRate = total > 0 ? (successes / total) * 100 : 0;

      return {
        action,
        successes,
        failures,
        total,
        successRate
      };
    });

    return stats;
  };

  return (
    <div className="space-y-6 p-4">
      {/* Timer Display */}
      {gamePhase !== "preview" && (
        <div className="fixed top-4 left-4 bg-primary text-white px-4 py-2 rounded-full">
          דקה: {minute}
        </div>
      )}

      {/* Goals Preview */}
      {gamePhase === "preview" && (
        <div id="goals-preview" className="space-y-4">
          <h2 className="text-2xl font-bold text-right">יעדי המשחק</h2>
          <div className="grid gap-4">
            {actions.map(action => (
              <div key={action.id} className="border p-4 rounded-lg text-right">
                <h3 className="font-semibold">{action.name}</h3>
                {action.goal && (
                  <p className="text-sm text-gray-600">יעד: {action.goal}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-end">
            <Button onClick={takeScreenshot}>
              צלם מסך
            </Button>
            <Button onClick={startMatch}>
              התחל משחק
            </Button>
          </div>
        </div>
      )}

      {/* Game Actions */}
      {(gamePhase === "playing" || gamePhase === "secondHalf") && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {actions.map(action => (
              <div key={action.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 hover:bg-green-500 hover:text-white"
                      onClick={() => logAction(action.id, "success")}
                    >
                      ✓
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => logAction(action.id, "failure")}
                    >
                      ✗
                    </Button>
                  </div>
                  <span className="font-medium">{action.name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-4">
            {gamePhase === "playing" ? (
              <Button onClick={endHalf}>
                סיום מחצית ראשונה
              </Button>
            ) : (
              <Button onClick={endMatch}>
                סיום משחק
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {calculateStats().map(({ action, successes, failures, successRate }) => (
              <div key={action.id} className="border p-4 rounded-lg text-right">
                <h3 className="font-semibold">{action.name}</h3>
                <div className="text-sm space-y-1">
                  <p>הצלחות: {successes}</p>
                  <p>כשלונות: {failures}</p>
                  <p>אחוז הצלחה: {successRate.toFixed(1)}%</p>
                  {action.goal && (
                    <p className="text-gray-600">יעד: {action.goal}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {gamePhase === "halftime" && (
            <Button onClick={startSecondHalf} className="w-full">
              התחל מחצית שנייה
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};