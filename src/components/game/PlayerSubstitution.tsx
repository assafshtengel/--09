import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface PlayerSubstitutionProps {
  minute: number;
  onPlayerExit: (playerName: string, canReturn: boolean) => void;
  onPlayerReturn: (playerName: string) => void;
}

export const PlayerSubstitution = ({ 
  minute,
  onPlayerExit,
  onPlayerReturn
}: PlayerSubstitutionProps) => {
  const [playerName, setPlayerName] = useState("");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [waitingForReturn, setWaitingForReturn] = useState<string | null>(null);

  const handlePlayerExit = () => {
    if (!playerName) {
      toast({
        title: "שגיאה",
        description: "יש להזין את שם השחקן",
        variant: "destructive",
      });
      return;
    }

    setShowExitDialog(true);
  };

  const handleExitConfirmation = (canReturn: boolean) => {
    onPlayerExit(playerName, canReturn);
    
    if (canReturn) {
      setWaitingForReturn(playerName);
      setShowReturnDialog(true);
    }
    
    setShowExitDialog(false);
    setPlayerName("");
  };

  const handlePlayerReturn = () => {
    if (waitingForReturn) {
      onPlayerReturn(waitingForReturn);
      setWaitingForReturn(null);
      setShowReturnDialog(false);
      toast({
        title: "השחקן חזר למשחק",
        description: `${waitingForReturn} חזר למשחק`,
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-right">חילופי שחקנים</h3>
      <div className="space-y-2">
        <Input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="שם השחקן"
          className="text-right"
        />
        <Button onClick={handlePlayerExit} className="w-full">
          יציאת שחקן
        </Button>
        
        {waitingForReturn && (
          <Button onClick={handlePlayerReturn} variant="outline" className="w-full">
            {`${waitingForReturn} חוזר למשחק`}
          </Button>
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>האם יש אפשרות שהשחקן ייכנס בהמשך?</DialogTitle>
            <DialogDescription>
              בחר את האפשרות המתאימה
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

      {/* Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>חזרת שחקן למשחק</DialogTitle>
            <DialogDescription>
              לחץ על הכפתור כאשר השחקן חוזר למשחק
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