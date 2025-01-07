import { Button } from "@/components/ui/button";
import { GamePhase } from "@/types/game";

interface GameControlsProps {
  gamePhase: GamePhase;
  onStartMatch: () => void;
  onEndHalf: () => void;
  onStartSecondHalf: () => void;
  onEndMatch: () => void;
}

export const GameControls = ({
  gamePhase,
  onStartMatch,
  onEndHalf,
  onStartSecondHalf,
  onEndMatch
}: GameControlsProps) => {
  return (
    <div className="p-4 border-t bg-white">
      <div className="flex justify-center gap-4">
        {gamePhase === "preview" && (
          <Button onClick={onStartMatch} className="bg-primary">
            התחל משחק
          </Button>
        )}
        
        {gamePhase === "playing" && (
          <Button onClick={onEndHalf} className="bg-primary">
            סיים מחצית
          </Button>
        )}
        
        {gamePhase === "halftime" && (
          <Button onClick={onStartSecondHalf} className="bg-primary">
            התחל מחצית שנייה
          </Button>
        )}
        
        {gamePhase === "secondHalf" && (
          <Button onClick={onEndMatch} className="bg-primary">
            סיים משחק
          </Button>
        )}
      </div>
    </div>
  );
};