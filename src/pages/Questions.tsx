import { useParams } from "react-router-dom";
import { PreMatchQuestionnaire } from "@/components/pre-match/PreMatchQuestionnaire";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const Questions = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (answers: Record<string, string>) => {
    if (!matchId) {
      toast({
        title: "שגיאה",
        description: "מזהה המשחק חסר",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pre_match_reports')
        .update({ 
          questions_answers: answers,
          status: 'completed'
        })
        .eq('match_id', matchId);

      if (error) throw error;

      toast({
        title: "נשמר בהצלחה",
        description: "התשובות נשמרו בהצלחה",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving answers:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת התשובות",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-right">שאלות טרום משחק</h1>
      <PreMatchQuestionnaire onSubmit={handleSubmit} />
    </div>
  );
};