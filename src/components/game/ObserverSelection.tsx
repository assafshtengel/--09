import { Button } from "@/components/ui/button";
import { UserPlus, Video } from "lucide-react";

interface ObserverSelectionProps {
  onStartMatch: (observerType: "parent" | "player") => void;
}

export const ObserverSelection = ({ onStartMatch }: ObserverSelectionProps) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Button
        onClick={() => onStartMatch("parent")}
        className="bg-accent hover:bg-accent/90 text-white flex items-center gap-2 h-12"
      >
        <UserPlus className="h-5 w-5" />
        לחץ למילוי הורה במהלך המשחק
      </Button>
      <Button
        onClick={() => onStartMatch("player")}
        className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 h-12"
      >
        <Video className="h-5 w-5" />
        לחץ למילוי שחקן בצפייה בשידור המשחק
      </Button>
    </div>
  );
};