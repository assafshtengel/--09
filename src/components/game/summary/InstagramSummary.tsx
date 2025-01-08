import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InstagramSummaryProps {
  actions: any[];
  actionLogs: any[];
  insights: string;
  matchId: string | undefined;
  opponent: string | null;
  onClose: () => void;
  onShare: () => void;
}

export const InstagramSummary = ({
  actions,
  actionLogs,
  insights,
  matchId,
  opponent,
  onClose,
  onShare,
}: InstagramSummaryProps) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, profile_picture_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setPlayerName(profile.full_name || "");
        setProfilePicture(profile.profile_picture_url);
      }
    };

    fetchPlayerProfile();
  }, []);

  const calculateOverallSuccess = () => {
    if (!actionLogs.length) return 0;
    const successfulActions = actionLogs.filter(log => log.result === "success").length;
    return (successfulActions / actionLogs.length) * 100;
  };

  const getTopActions = () => {
    return actions.slice(0, 3).map(action => {
      const actionStats = actionLogs.filter(log => log.actionId === action.id);
      const successCount = actionStats.filter(log => log.result === "success").length;
      return {
        name: action.name,
        success: successCount,
        total: actionStats.length,
        rate: actionStats.length > 0 ? (successCount / actionStats.length) * 100 : 0
      };
    });
  };

  const getKeyInsight = () => {
    if (!insights) return "Keep pushing forward! 💪";
    const insightsList = insights.split('\n\n');
    return insightsList[0] || "Keep pushing forward! 💪";
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        <div id="instagram-summary" className="bg-gradient-to-br from-blue-500/10 to-green-500/10 p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <h2 className="text-xl font-bold">{playerName}</h2>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'dd/MM/yyyy')} {opponent && `vs ${opponent}`}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Overall Performance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-500/5 to-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">הצלחה כללית</h3>
                    <Progress value={calculateOverallSuccess()} className="mt-2" />
                    <p className="text-2xl font-bold mt-2">
                      {calculateOverallSuccess().toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold">פעולות מובילות</h3>
            {getTopActions().map((action, index) => (
              <Card key={index} className="bg-gradient-to-r from-blue-500/5 to-green-500/5">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {action.success}/{action.total}
                    </span>
                    <span className="font-medium">{action.name}</span>
                  </div>
                  <Progress value={action.rate} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* AI Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-primary/10 p-4 rounded-lg"
          >
            <p className="text-center font-medium">{getKeyInsight()}</p>
          </motion.div>

          {/* Share Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center"
          >
            <Button
              onClick={onShare}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              שתף באינסטגרם
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};