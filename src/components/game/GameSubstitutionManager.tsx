import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlayerSubstitution } from "./PlayerSubstitution";

interface GameSubstitutionManagerProps {
  matchId: string;
  minute: number;
}

export const GameSubstitutionManager = ({ matchId, minute }: GameSubstitutionManagerProps) => {
  const { toast } = useToast();

  const handlePlayerExit = async (playerName: string, canReturn: boolean) => {
    try {
      const { error } = await supabase
        .from('match_substitutions')
        .insert([
          {
            match_id: matchId,
            minute,
            player_in: "",
            player_out: playerName
          }
        ]);

      if (error) throw error;

      toast({
        title: "חילוף בוצע",
        description: `${playerName} יצא מהמשחק`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving substitution:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את החילוף",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handlePlayerReturn = async (playerName: string) => {
    try {
      const { error } = await supabase
        .from('match_substitutions')
        .insert([
          {
            match_id: matchId,
            minute,
            player_in: playerName,
            player_out: ""
          }
        ]);

      if (error) throw error;

      toast({
        title: "חילוף בוצע",
        description: `${playerName} חזר למשחק`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error saving substitution:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את החילוף",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <PlayerSubstitution
      minute={minute}
      onPlayerExit={handlePlayerExit}
      onPlayerReturn={handlePlayerReturn}
    />
  );
};