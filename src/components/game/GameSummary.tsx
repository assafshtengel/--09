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
  matchDate?: string; // Make it optional to maintain backward compatibility
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

  const sendEmail = async (recipientType: 'user' | 'coach') => {
    try {
      setIsSendingEmail(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      // Get player's profile including coach's email
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
      const emailContent = `
        <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h1 style="color: #1E40AF; font-size: 24px;">סיכום משחק - ${playerName}</h1>
          
          <div style="margin: 20px 0;">
            <h2 style="color: #2563eb;">פרטי המשחק</h2>
            ${opponent ? `<p>נגד: ${opponent}</p>` : ''}
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #4b5563;">פעולות במשחק</h3>
            <ul style="list-style-type: none; padding: 0;">
              ${actions.map(action => `
                <li style="margin: 5px 0;">${action.name} - יעד: ${action.goal || 'לא הוגדר'}</li>
              `).join('')}
            </ul>
          </div>

          ${actionLogs.length > 0 ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #4b5563;">יומן פעולות</h3>
              <ul style="list-style-type: none; padding: 0;">
                ${actionLogs.map(log => `
                  <li style="margin: 5px 0;">
                    דקה ${log.minute}: ${log.actionId} - ${log.result}
                    ${log.note ? `<br>הערה: ${log.note}` : ''}
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          ${generalNotes.length > 0 ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #4b5563;">הערות כלליות</h3>
              <ul style="list-style-type: none; padding: 0;">
                ${generalNotes.map(note => `<li style="margin: 5px 0;">${note.text}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${insights ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #4b5563;">תובנות AI</h3>
              <p style="margin: 10px 0;">${insights}</p>
            </div>
          ` : ''}

          ${Object.keys(performanceRatings).length > 0 ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #4b5563;">דירוגי ביצועים</h3>
              <ul style="list-style-type: none; padding: 0;">
                ${Object.entries(performanceRatings).map(([key, value]) => `
                  <li style="margin: 5px 0;">${key}: ${value}/10</li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;

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
              onEmailSend={sendEmail}
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
              matchDate={matchDate || new Date().toISOString()} // Provide a fallback
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};