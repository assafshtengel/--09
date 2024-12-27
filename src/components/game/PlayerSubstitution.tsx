import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

interface PlayerSubstitutionProps {
  minute: number;
  onSubstitution: (sub: SubstitutionLog) => void;
}

export const PlayerSubstitution = ({ minute, onSubstitution }: PlayerSubstitutionProps) => {
  const [playerIn, setPlayerIn] = useState("");
  const [playerOut, setPlayerOut] = useState("");

  const handleSubstitution = () => {
    if (!playerIn || !playerOut) {
      toast({
        title: "שגיאה",
        description: "יש להזין את שמות השחקנים",
        variant: "destructive",
      });
      return;
    }

    onSubstitution({
      playerIn,
      playerOut,
      minute
    });

    setPlayerIn("");
    setPlayerOut("");

    toast({
      title: "חילוף בוצע",
      description: `${playerOut} יצא, ${playerIn} נכנס`,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold text-right">חילוף שחקנים</h3>
      <div className="space-y-2">
        <Input
          value={playerOut}
          onChange={(e) => setPlayerOut(e.target.value)}
          placeholder="שם השחקן היוצא"
          className="text-right"
        />
        <Input
          value={playerIn}
          onChange={(e) => setPlayerIn(e.target.value)}
          placeholder="שם השחקן הנכנס"
          className="text-right"
        />
        <Button onClick={handleSubstitution} className="w-full">
          בצע חילוף
        </Button>
      </div>
    </div>
  );
};