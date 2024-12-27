import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { ActionItem } from "./game/ActionItem";
import { GameStats } from "./game/GameStats";
import { GameSummary } from "./game/GameSummary";
import { GamePreview } from "./game/GamePreview";
import { GamePhaseManager } from "./game/GamePhaseManager";
import { PlayerSubstitution } from "./game/PlayerSubstitution";

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

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Timer Display */}
      {gamePhase !== "preview" && (
        <div className="fixed top-4 left-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50">
          דקה: {minute}
        </div>
      )}

      {/* Game Preview */}
      {gamePhase === "preview" && (
        <GamePreview
          actions={actions}
          onActionAdd={handleAddAction}
          onStartMatch={startMatch}
        />
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
          
          <GamePhaseManager
            gamePhase={gamePhase}
            onStartMatch={startMatch}
            onEndHalf={endHalf}
            onStartSecondHalf={startSecondHalf}
            onEndMatch={endMatch}
          />
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