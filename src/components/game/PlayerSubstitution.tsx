import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { SubstitutionLog } from "@/types/game";

export interface PlayerSubstitutionProps {
  minute: number;
  onSubstitute: (sub: SubstitutionLog) => Promise<void>;
}

export const PlayerSubstitution = ({ 
  minute,
  onSubstitute
}: PlayerSubstitutionProps) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [waitingForReturn, setWaitingForReturn] = useState<string | null>(null);
  const [hasEndedGame, setHasEndedGame] = useState(false);

  const handlePlayerExit = () => {
    setShowExitDialog(true);
  };

  const handleExitConfirmation = (canReturn: boolean) => {
    const playerName = "שחקן"; // Default player name since we're not collecting it anymore
    
    if (canReturn) {
      setWaitingForReturn(playerName);
      setShowReturnDialog(true);
      onSubstitute({
        playerIn: "",
        playerOut: playerName,
        minute
      });
    } else {
      setHasEndedGame(true);
      onSubstitute({
        playerIn: "",
        playerOut: playerName,
        minute
      });
    }
    
    setShowExitDialog(false);
  };

  const handlePlayerReturn = async () => {
    if (waitingForReturn) {
      await onSubstitute({
        playerIn: waitingForReturn,
        playerOut: "",
        minute
      });
      setWaitingForReturn(null);
      setShowReturnDialog(false);
      toast({
        title: "השחקן חזר למשחק",
        description: `השחקן חזר למשחק`,
      });
    }
  };

  if (hasEndedGame) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-right">חילופי שחקנים</h3>
      <div className="space-y-2">
        <Button onClick={handlePlayerExit} className="w-full">
          יציאת שחקן
        </Button>
        
        {waitingForReturn && (
          <Button onClick={handlePlayerReturn} variant="outline" className="w-full">
            החזר שחקן למשחק
          </Button>
        )}
      </div>

      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>האם יש אפשרות שהשחקן ייכנס בהמשך?</DialogTitle>
            <DialogDescription>
              בחר את האפשרות המתאימה לחילוף השחקן
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end">
            <Button onClick={() => handleExitConfirmation(true)}>
              כן, יכול לחזור
            </Button>
            <Button onClick={() => handleExitConfirmation(false)} variant="destructive">
              לא, סיים משחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>חזרת שחקן למשחק</DialogTitle>
            <DialogDescription>
              לחץ על הכפתור כאשר השחקן מוכן לחזור למשחק
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handlePlayerReturn}>
              השחקן חזר למשחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};