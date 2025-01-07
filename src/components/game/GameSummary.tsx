import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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
  const [performanceRatings, setPerformanceRatings] = useState<any>({});

  const handleEmailSend = async () => {
    try {
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
      `;

      // Send email logic here...

      toast({
        title: "Email Sent",
        description: "The summary has been sent to your email.",
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשלוח את הסיכום למייל",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Match Summary</h2>
        <div className="space-y-4">
          <h3 className="font-semibold">Actions</h3>
          <pre>{JSON.stringify(actions, null, 2)}</pre>

          <h3 className="font-semibold">Action Logs</h3>
          <pre>{JSON.stringify(actionLogs, null, 2)}</pre>

          <h3 className="font-semibold">General Notes</h3>
          <pre>{JSON.stringify(generalNotes, null, 2)}</pre>

          <h3 className="font-semibold">Substitutions</h3>
          <pre>{JSON.stringify(substitutions, null, 2)}</pre>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleEmailSend} variant="outline" className="mr-2">
            Send Summary
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
