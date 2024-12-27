import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import html2canvas from "html2canvas";
import { Action } from "@/components/ActionSelector";
import { ActionItem } from "./game/ActionItem";
import { GameStats } from "./game/GameStats";
import { GameSummary } from "./game/GameSummary";
import { AdditionalActions } from "./game/AdditionalActions";
import { PlayerSubstitution } from "./game/PlayerSubstitution";
import { GameInsights } from "./game/GameInsights";

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

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

export const GameTracker = ({ actions: initialActions }: GameTrackerProps) => {
  const [gamePhase, setGamePhase] = useState<GamePhase>("preview");
  const [minute, setMinute] = useState(0);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [actions, setActions] = useState<Action[]>(initialActions);
  const [generalNote, setGeneralNote] = useState("");
  const [generalNotes, setGeneralNotes] = useState<Array<{ text: string; minute: number }>>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionLog[]>([]);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleAddAction = (newAction: Action) => {
    setActions(prev => [...prev, newAction]);
    toast({
      title: "פעולה נוספה",
      description: `הפעולה ${newAction.name} נוספה למעקב`,
    });
  };

  const handleAddGeneralNote = () => {
    if (!generalNote.trim()) {
      toast({
        title: "שגיאה",
        description: "יש להזין טקסט להערה",
        variant: "destructive",
      });
      return;
    }

    setGeneralNotes(prev => [...prev, { text: generalNote, minute }]);
    setGeneralNote("");
    toast({
      title: "הערה נוספה",
      description: "ההערה נשמרה בהצלחה",
    });
  };

  const handleSubstitution = (sub: SubstitutionLog) => {
    setSubstitutions(prev => [...prev, sub]);
  };

  const startMatch = () => {
    setGamePhase("playing");
    const interval = setInterval(() => {
      setMinute(prev => prev + 1);
    }, 60000);
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

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Timer Display */}
      {gamePhase !== "preview" && (
        <div className="fixed top-4 left-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50">
          דקה: {minute}
        </div>
      )}

      {/* Goals Preview */}
      {gamePhase === "preview" && (
        <div id="goals-preview" className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-right mb-4">יעדי המשחק</h2>
            <div className="grid gap-3">
              {actions.map(action => (
                <div key={action.id} className="border p-3 rounded-lg text-right hover:bg-gray-50 transition-colors">
                  <h3 className="font-semibold">{action.name}</h3>
                  {action.goal && (
                    <p className="text-sm text-gray-600 mt-1">יעד: {action.goal}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <AdditionalActions onActionSelect={handleAddAction} />
          
          <div className="flex gap-3 justify-end">
            <Button onClick={takeScreenshot} variant="outline" size="sm">
              צלם מסך
            </Button>
            <Button onClick={startMatch} size="sm">
              התחל משחק
            </Button>
          </div>
        </div>
      )}

      {/* Game Actions */}
      {(gamePhase === "playing" || gamePhase === "secondHalf") && (
        <div className="space-y-4">
          <GameStats actions={actions} actionLogs={actionLogs} />
          
          <div className="grid gap-3">
            {actions.map(action => (
              <ActionItem
                key={action.id}
                action={action}
                onLog={logAction}
              />
            ))}
          </div>

          {/* General Note */}
          <div className="flex gap-2 items-center">
            <Button onClick={handleAddGeneralNote} size="sm">
              הוסף הערה
            </Button>
            <Input
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder="הערה כללית..."
              className="text-right text-sm"
            />
          </div>

          {/* Player Substitution */}
          <PlayerSubstitution
            minute={minute}
            onSubstitution={handleSubstitution}
          />
          
          <div className="flex justify-end gap-3">
            {gamePhase === "playing" ? (
              <Button onClick={endHalf} size="sm">
                סיום מחצית ראשונה
              </Button>
            ) : (
              <Button onClick={endMatch} size="sm">
                סיום משחק
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-md mx-auto">
          <GameSummary 
            actions={actions}
            actionLogs={actionLogs}
            generalNotes={generalNotes}
            substitutions={substitutions}
            onClose={() => setShowSummary(false)}
            gamePhase={gamePhase === "halftime" ? "halftime" : "ended"}
            onContinueGame={gamePhase === "halftime" ? startSecondHalf : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};