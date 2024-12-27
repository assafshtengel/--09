import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface PlayerFormProps {
  onSubmit: (data: PlayerFormData) => void;
}

export interface PlayerFormData {
  playerName: string;
  opponentTeam: string;
  matchDate: string;
  position: string;
}

export const PlayerForm = ({ onSubmit }: PlayerFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PlayerFormData>({
    playerName: "",
    opponentTeam: "",
    matchDate: "",
    position: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.playerName || !formData.opponentTeam || !formData.matchDate || !formData.position) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="playerName" className="block text-right mb-2">שם השחקן</label>
          <Input
            id="playerName"
            value={formData.playerName}
            onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
            className="text-right"
            placeholder="הכנס את שמך"
          />
        </div>

        <div>
          <label htmlFor="opponentTeam" className="block text-right mb-2">קבוצה יריבה</label>
          <Input
            id="opponentTeam"
            value={formData.opponentTeam}
            onChange={(e) => setFormData({ ...formData, opponentTeam: e.target.value })}
            className="text-right"
            placeholder="שם הקבוצה היריבה"
          />
        </div>

        <div>
          <label htmlFor="matchDate" className="block text-right mb-2">תאריך המשחק</label>
          <Input
            id="matchDate"
            type="date"
            value={formData.matchDate}
            onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
            className="text-right"
          />
        </div>

        <div>
          <label htmlFor="position" className="block text-right mb-2">תפקיד במגרש</label>
          <Select
            value={formData.position}
            onValueChange={(value) => setFormData({ ...formData, position: value })}
          >
            <SelectTrigger className="text-right">
              <SelectValue placeholder="בחר תפקיד" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="goalkeeper">שוער</SelectItem>
              <SelectItem value="defender">מגן</SelectItem>
              <SelectItem value="midfielder">קשר</SelectItem>
              <SelectItem value="forward">חלוץ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        המשך
      </Button>
    </form>
  );
};