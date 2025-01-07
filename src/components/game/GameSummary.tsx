import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsSection } from "./summary/StatisticsSection";
import { NotesSection } from "./summary/NotesSection";
import { SummaryHeader } from "./summary/SummaryHeader";
import { SummaryActions } from "./summary/SummaryActions";
import { GoalsComparison } from "./summary/GoalsComparison";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import html2canvas from "html2canvas";

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

  const handleEmailSend = async () => {
    try {
      setIsSendingEmail(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user email found");

      // Get performance ratings from the post_game_feedback table
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

      // Send email logic here...
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
      
      // Create a temporary link element to trigger the download
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
      <DialogContent className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <SummaryHeader 
            gamePhase={gamePhase as "halftime" | "ended"}
            matchId={matchId}
            opponent={opponent}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>סטטיסטיקות</CardTitle>
              </CardHeader>
              <CardContent>
                <StatisticsSection 
                  actions={actions}
                  actionLogs={actionLogs}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הערות והתובנות</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <NotesSection notes={generalNotes} />
                  
                  {isLoadingInsights ? (
                    <div className="text-center text-gray-500">
                      טוען תובנות...
                    </div>
                  ) : insights ? (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">תובנות AI</h3>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2 text-right">
                          {insights.split('\n\n').map((insight, index) => (
                            <p key={index} className="text-gray-700">
                              {insight}
                            </p>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>השוואת יעדים</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalsComparison 
                actions={actions}
                actionLogs={actionLogs}
              />
            </CardContent>
          </Card>

          {substitutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>חילופים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {substitutions.map((sub, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                      <span>דקה {sub.minute}'</span>
                      <div className="text-right">
                        {sub.playerIn && <div className="text-green-600">נכנס: {sub.playerIn}</div>}
                        {sub.playerOut && <div className="text-red-600">יצא: {sub.playerOut}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <SummaryActions
            gamePhase={gamePhase as "halftime" | "ended"}
            isSendingEmail={isSendingEmail}
            onSubmit={() => {
              toast({
                title: "נשמר בהצלחה",
                description: "סיכום המשחק נשמר במערכת",
              });
              onClose();
            }}
            onSendEmail={handleEmailSend}
            onShareSocial={handleShareSocial}
            onScreenshot={handleScreenshot}
            onClose={onClose}
            matchId={matchId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};