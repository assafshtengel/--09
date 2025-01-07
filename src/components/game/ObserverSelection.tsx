import { Button } from "@/components/ui/button";
import { UserPlus, Video } from "lucide-react";

interface ObserverSelectionProps {
  onStartMatch: (observerType: "parent" | "player") => void;
}

export const ObserverSelection = ({ onStartMatch }: ObserverSelectionProps) => {
  return (
    <div className="flex flex-col items-center gap-3 p-4 max-w-md mx-auto w-full">
      <Button
        onClick={() => onStartMatch("parent")}
        className="bg-[#E31C58] hover:bg-[#E31C58]/90 text-white flex items-center gap-2 h-12 w-full justify-center rounded-full text-base"
      >
        <UserPlus className="h-5 w-5" />
        לחץ למילוי הורה במהלך המשחק
      </Button>
      <Button
        onClick={() => onStartMatch("player")}
        className="bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white flex items-center gap-2 h-12 w-full justify-center rounded-full text-base"
      >
        <Video className="h-5 w-5" />
        לחץ למילוי שחקן בצפייה בשידור המשחק
      </Button>
    </div>
  );
};