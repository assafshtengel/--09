import { Button } from "@/components/ui/button";

interface GamePhaseManagerProps {
  gamePhase: "preview" | "playing" | "halftime" | "secondHalf" | "ended";
  onStartMatch: () => void;
  onEndHalf: () => void;
  onStartSecondHalf: () => void;
  onEndMatch: () => void;
}

export const GamePhaseManager = ({
  gamePhase,
  onStartMatch,
  onEndHalf,
  onStartSecondHalf,
  onEndMatch
}: GamePhaseManagerProps) => {
  return (
    <div className="flex justify-end gap-3">
      {gamePhase === "preview" && (
        <Button onClick={onStartMatch} size="sm">
          התחל משחק
        </Button>
      )}
      {gamePhase === "playing" && (
        <Button onClick={onEndHalf} size="sm">
          סיום מחצית ראשונה
        </Button>
      )}
      {gamePhase === "secondHalf" && (
        <Button onClick={onEndMatch} size="sm">
          סיום משחק
        </Button>
      )}
    </div>
  );
};