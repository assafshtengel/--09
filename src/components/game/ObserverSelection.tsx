import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ObserverSelectionProps {
  onSelect: (observer: "parent" | "player") => void;
}

export const ObserverSelection = ({ onSelect }: ObserverSelectionProps) => {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-right">מי ממלא את המשוב בזמן המשחק?</h2>
      <div className="grid gap-4">
        <Card 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onSelect("parent")}
        >
          <Button 
            variant="ghost" 
            className="w-full justify-end text-lg"
          >
            הורה במהלך המשחק
          </Button>
        </Card>
        <Card 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onSelect("player")}
        >
          <Button 
            variant="ghost" 
            className="w-full justify-end text-lg"
          >
            השחקן בצפייה לאחר המשחק
          </Button>
        </Card>
      </div>
    </div>
  );
};