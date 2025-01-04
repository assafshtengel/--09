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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // First create a pre-match report
      const { data: report, error: reportError } = await supabase
        .from('pre_match_reports')
        .insert({
          player_id: user.id,
          match_date: new Date().toISOString().split('T')[0],
          questions_answers: answers,
          status: 'completed'
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Then update the match with the pre_match_report_id
      const { error: matchError } = await supabase
        .from('matches')
        .update({ 
          pre_match_report_id: report.id
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

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