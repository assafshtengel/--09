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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:relative md:shadow-none md:border-none">
      <div className="flex justify-center gap-3">
        {gamePhase === "preview" && (
          <Button 
            onClick={onStartMatch} 
            size="lg"
            className="w-full md:w-auto"
          >
            התחל משחק
          </Button>
        )}
        {gamePhase === "playing" && (
          <Button 
            onClick={onEndHalf} 
            size="lg"
            className="w-full md:w-auto"
          >
            סיום מחצית ראשונה
          </Button>
        )}
        {gamePhase === "secondHalf" && (
          <Button 
            onClick={onEndMatch} 
            size="lg"
            className="w-full md:w-auto"
          >
            סיום משחק
          </Button>
        )}
      </div>
    </div>
  );
};