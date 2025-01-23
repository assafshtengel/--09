import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useCallback } from "react";
import { SummaryHeader } from "./summary/SummaryHeader";
import { StatisticsSection } from "./summary/StatisticsSection";
import { InsightsSection } from "./summary/InsightsSection";
import { SharingSection } from "./summary/SharingSection";
import { QuestionsSection } from "./summary/QuestionsSection";
import { PerformanceRatings } from "./summary/PerformanceRatings";
import { ActionsLogSection } from "./summary/ActionsLogSection";
import { NotesSection } from "./summary/NotesSection";
import { GoalsComparison } from "./summary/GoalsComparison";
import { AchievementsSection } from "./summary/AchievementsSection";
import { generateEmailContent } from "./summary/EmailTemplate";
import { HavayaRatings } from "./summary/HavayaRatings";
import debounce from 'lodash/debounce';

interface GameSummaryProps {
  actions: any[];
  actionLogs: any[];
  generalNotes: any[];
  substitutions: any[];
  onClose: () => void;
  gamePhase: string;
  matchId: string | undefined;
  opponent: string | null;
  matchDate?: string;
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
  matchDate,
}: GameSummaryProps) => {
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [insights, setInsights] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [performanceRatings, setPerformanceRatings] = useState<Record<string, number>>({});
  const [additionalAnswers, setAdditionalAnswers] = useState<Record<string, any>>({});
  const [showCaptionPopup, setShowCaptionPopup] = useState(false);
  const [havayaRatings, setHavayaRatings] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

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

  // Debounced save function to prevent multiple rapid saves
  const debouncedSave = useCallback(
    debounce(async (
      ratings: Record<string, number>,
      answers: Record<string, any>,
      havayaRatings: Record<string, number>
    ) => {
      if (!matchId || isSaving) return;

      setIsSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          throw new Error('No authenticated user found');
        }

        const feedbackData = {
          match_id: matchId,
          player_id: user.id,
          performance_ratings: ratings,
          questions_answers: {
            additionalQuestions: answers
          },
          havaya_ratings: havayaRatings
        };

        // First try to update
        const { error: updateError } = await supabase
          .from('post_game_feedback')
          .update(feedbackData)
          .eq('match_id', matchId);

        // If update fails (no existing record), then insert
        if (updateError) {
          const { error: insertError } = await supabase
            .from('post_game_feedback')
            .insert([feedbackData]);

          if (insertError) throw insertError;
        }

        toast({
          title: "נשמר בהצלחה",
          description: "המשוב נשמר במערכת",
        });
      } catch (error) {
        console.error('Error in saveToDatabase:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לשמור את המשוב",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [matchId, isSaving]
  );

  const handleRatingsChange = (ratings: Record<string, number>) => {
    setPerformanceRatings(ratings);
    debouncedSave(ratings, additionalAnswers, havayaRatings);
  };

  const handleAnswersChange = (answers: Record<string, any>) => {
    setAdditionalAnswers(answers);
    debouncedSave(performanceRatings, answers, havayaRatings);
  };

  const handleHavayaRatingsChange = (ratings: Record<string, number>) => {
    setHavayaRatings(ratings);
    debouncedSave(performanceRatings, additionalAnswers, ratings);
  };

  const handleEmailSend = async (recipientType: 'user' | 'coach') => {
    try {
      setIsSendingEmail(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, coach_email')
        .eq('id', user.id)
        .single();

      if (recipientType === 'coach' && !profile?.coach_email) {
        toast({
          title: "שגיאה",
          description: "לא נמצא מייל של המאמן בפרופיל",
          variant: "destructive",
        });
        return;
      }

      const playerName = profile?.full_name || "שחקן";
      const emailContent = generateEmailContent({
        playerName,
        opponent,
        actions,
        actionLogs,
        generalNotes,
        insights,
        performanceRatings,
      });

      const { error } = await supabase.functions.invoke('send-game-summary', {
        body: {
          to: recipientType === 'coach' ? [profile.coach_email] : [user.email],
          subject: `סיכום משחק - ${playerName} ${opponent ? `נגד ${opponent}` : ''}`,
          html: emailContent,
        },
      });

      if (error) throw error;

      toast({
        title: "המייל נשלח בהצלחה",
        description: recipientType === 'coach' ? "הסיכום נשלח למאמן" : "הסיכום נשלח למייל שלך",
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

            {gamePhase === "ended" && (
              <>
                <AchievementsSection
                  matchId={matchId}
                  onSave={() => {}}
                />
                <HavayaRatings
                  matchId={matchId}
                  onRatingsChange={handleHavayaRatingsChange}
                />
              </>
            )}

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
              onShareSocial={(platform) => {
                toast({
                  title: "שיתוף",
                  description: `שיתוף לפלטפורמת ${platform} יתווסף בקרוב`,
                });
              }}
              isSendingEmail={isSendingEmail}
              actions={actions}
              actionLogs={actionLogs}
              insights={insights}
              matchId={matchId}
              opponent={opponent}
              matchDate={matchDate || new Date().toISOString()}
              onCaptionClose={() => setShowCaptionPopup(false)}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};