import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DailyRoutine {
  sleep_hours: number;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string;
  water_intake?: number;
  notes?: string;
}

export const useDailyRoutine = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const saveDailyRoutine = async (routine: DailyRoutine) => {
    try {
      setIsLoading(true);
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('daily_routines')
        .insert({
          ...routine,
          player_id: user.id
        });

      if (error) throw error;

      toast({
        title: "נשמר בהצלחה",
        description: "הנתונים היומיים נשמרו בהצלחה",
      });
    } catch (error) {
      console.error('Error saving daily routine:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הנתונים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveDailyRoutine
  };
};