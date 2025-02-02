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
import { useNavigate, useParams } from 'react-router-dom';

export interface GameSummaryProps {
  actions?: any[];
  actionLogs?: any[];
  generalNotes?: any[];
  substitutions?: any[];
  onClose?: () => void;
  gamePhase?: string;
  matchId?: string;
  opponent?: string | null;
  matchDate?: string;
}

export const GameSummary = ({
  actions = [],
  actionLogs = [],
  generalNotes = [],
  substitutions = [],
  onClose,
  gamePhase = "ended",
  matchId: propMatchId,
  opponent: propOpponent,
  matchDate: propMatchDate,
}: GameSummaryProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [insights, setInsights] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [performanceRatings, setPerformanceRatings] = useState<Record<string, number>>({});
  const [additionalAnswers, setAdditionalAnswers] = useState<Record<string, any>>({});
  const [showCaptionPopup, setShowCaptionPopup] = useState(false);
  const [havayaRatings, setHavayaRatings] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [matchActions, setMatchActions] = useState<any[]>([]);
  const [matchActionLogs, setMatchActionLogs] = useState<any[]>([]);
  const [matchNotes, setMatchNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const matchId = propMatchId || id;
  const opponent = propOpponent || matchData?.opponent;
  const matchDate = propMatchDate || matchData?.match_date;

  useEffect(() => {
    const loadMatchData = async () => {
      if (!matchId || matchId === ':id?') {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Load match data
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .maybeSingle();

        if (matchError) throw matchError;
        setMatchData(match);

        // Load match actions
        const { data: actions, error: actionsError } = await supabase
          .from('match_actions')
          .select('*')
          .eq('match_id', matchId);

        if (actionsError) throw actionsError;
        setMatchActions(actions || []);
        setMatchActionLogs(actions || []);

        // Load match notes
        const { data: notes, error: notesError } = await supabase
          .from('match_notes')
          .select('*')
          .eq('match_id', matchId);

        if (notesError) throw notesError;
        setMatchNotes(notes || []);

      } catch (error) {
        console.error('Error loading match data:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את נתוני המשחק",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatchData();
  }, [matchId, toast]);

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

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  if (!matchId || matchId === ':id?') {
    return null;
  }

  if (isLoading) {
    return (
      <Dialog open onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl mx-auto h-[90vh]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">טוען נתוני משחק...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={handleClose}>
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
              actions={matchActions}
              actionLogs={matchActionLogs}
            />

            <InsightsSection
              insights={insights}
              isLoading={isLoadingInsights}
            />

            <ActionsLogSection
              actions={matchActions}
              actionLogs={matchActionLogs}
            />

            <GoalsComparison
              actions={matchActions}
              actionLogs={matchActionLogs}
            />

            {gamePhase === "ended" && (
              <>
                <PerformanceRatings onRatingsChange={handleRatingsChange} />
                <QuestionsSection onAnswersChange={handleAnswersChange} />
              </>
            )}

            <NotesSection notes={matchNotes} />

            <SharingSection
              onEmailSend={(type) => {
                setIsSendingEmail(true);
                handleEmailSend(type)
                  .finally(() => setIsSendingEmail(false));
              }}
              onShareSocial={(platform) => {
                toast({
                  title: "שיתוף",
                  description: `שיתוף לפלטפורמת ${platform} יתווסף בקרוב`,
                });
              }}
              isSendingEmail={isSendingEmail}
              actions={matchActions}
              actionLogs={matchActionLogs}
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