import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { SummaryHeader } from "./summary/SummaryHeader";
import { StatisticsSection } from "./summary/StatisticsSection";
import { InsightsSection } from "./summary/InsightsSection";
import { SharingSection } from "./summary/SharingSection";
import { QuestionsSection } from "./summary/QuestionsSection";
import { PerformanceRatings } from "./summary/PerformanceRatings";
import { ActionsLogSection } from "./summary/ActionsLogSection";
import { NotesSection } from "./summary/NotesSection";
import { GoalsComparison } from "./summary/GoalsComparison";
import html2canvas from 'html2canvas';

interface GameSummaryProps {
  actions: any[];
  actionLogs: any[];
  generalNotes: any[];
  substitutions: any[];
  onClose: () => void;
  gamePhase: string;
  matchId: string | undefined;
  opponent: string | null;
}

export const GameSummary = ({
  actions,
  actionLogs,
  generalNotes,
  substitutions,
  onClose,
  gamePhase,
  matchId,
  opponent,
}: GameSummaryProps) => {
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [insights, setInsights] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [performanceRatings, setPerformanceRatings] = useState<Record<string, number>>({});
  const [additionalAnswers, setAdditionalAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadInsights = async () => {
      if (!matchId) return;
      
      setIsLoadingInsights(true);
      try {
        const response = await supabase.functions.invoke('generate-game-insights', {
          body: { matchId },
        });

        if (response.error) throw response.error;
        setInsights(response.data.insights);
      } catch (error) {
        console.error('Error loading insights:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את התובנות",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadInsights();
  }, [matchId]);

  const handleRatingsChange = async (ratings: Record<string, number>) => {
    setPerformanceRatings(ratings);
    await saveToDatabase(ratings, additionalAnswers);
  };

  const handleAnswersChange = async (answers: Record<string, any>) => {
    setAdditionalAnswers(answers);
    await saveToDatabase(performanceRatings, answers);
  };

  const saveToDatabase = async (ratings: Record<string, number>, answers: Record<string, any>) => {
    if (!matchId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      const feedbackData = {
        performance_ratings: ratings,
        questions_answers: {
          additionalQuestions: answers
        }
      };

      const { data: existingFeedback } = await supabase
        .from('post_game_feedback')
        .select('*')
        .eq('match_id', matchId)
        .maybeSingle();

      if (existingFeedback) {
        await supabase
          .from('post_game_feedback')
          .update(feedbackData)
          .eq('match_id', matchId);
      } else {
        await supabase
          .from('post_game_feedback')
          .insert({
            match_id: matchId,
            player_id: user.id,
            ...feedbackData
          });
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את המשוב",
        variant: "destructive",
      });
    }
  };

  const handleEmailSend = async () => {
    try {
      setIsSendingEmail(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const { data: feedback } = await supabase
        .from('post_game_feedback')
        .select('performance_ratings')
        .eq('match_id', matchId)
        .maybeSingle();

      const performanceRatings = feedback?.performance_ratings || {};

      const emailContent = `
        Summary of the match against ${opponent}:
        Performance Ratings: ${JSON.stringify(performanceRatings, null, 2)}
        Actions: ${JSON.stringify(actions, null, 2)}
        Action Logs: ${JSON.stringify(actionLogs, null, 2)}
        General Notes: ${JSON.stringify(generalNotes, null, 2)}
        Substitutions: ${JSON.stringify(substitutions, null, 2)}
        
        AI Insights:
        ${insights}
      `;

      const { error } = await supabase.functions.invoke('send-game-summary', {
        body: {
          to: [user.email],
          subject: `סיכום משחק - ${opponent || 'ללא יריב'}`,
          html: emailContent,
        },
      });

      if (error) throw error;

      toast({
        title: "אימייל נשלח",
        description: "סיכום המשחק נשלח לכתובת המייל שלך",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח את הסיכום למייל",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleShareSocial = (platform: 'facebook' | 'instagram') => {
    toast({
      title: "שיתוף",
      description: `שיתוף לפלטפורמת ${platform} יתווסף בקרוב`,
    });
  };

  const handleScreenshot = async () => {
    try {
      const element = document.getElementById('game-summary-content');
      if (!element) {
        throw new Error('Summary content element not found');
      }

      const canvas = await html2canvas(element);
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `game-summary-${new Date().toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "צילום מסך נשמר",
        description: "התמונה נשמרה בהצלחה",
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את צילום המסך",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto h-[90vh]">
        <ScrollArea className="h-full pr-4">
          <div id="game-summary-content" className="space-y-6">
            <SummaryHeader
              gamePhase={gamePhase as "halftime" | "ended"}
              matchId={matchId}
              opponent={opponent}
            />

            <StatisticsSection
              actions={actions}
              actionLogs={actionLogs}
            />

            <InsightsSection
              insights={insights}
              isLoading={isLoadingInsights}
            />

            <ActionsLogSection
              actions={actions}
              actionLogs={actionLogs}
            />

            <GoalsComparison
              actions={actions}
              actionLogs={actionLogs}
            />

            {gamePhase === "ended" && (
              <>
                <PerformanceRatings onRatingsChange={handleRatingsChange} />
                <QuestionsSection onAnswersChange={handleAnswersChange} />
              </>
            )}

            <NotesSection notes={generalNotes} />

            <SharingSection
              onEmailSend={handleEmailSend}
              onShareSocial={handleShareSocial}
              onScreenshot={handleScreenshot}
              isSendingEmail={isSendingEmail}
              actions={actions}
              actionLogs={actionLogs}
              insights={insights}
              matchId={matchId}
              opponent={opponent}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};