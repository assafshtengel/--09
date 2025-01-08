import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Share2, Instagram, Quote, Target, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [havaya, setHavaya] = useState<string[]>([]);
  const [preMatchAnswers, setPreMatchAnswers] = useState<Record<string, any>>({});
  const [isSharing, setIsSharing] = useState(false);

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

      // Fetch pre-match report data
      if (matchId) {
        const { data: match } = await supabase
          .from('matches')
          .select('pre_match_report_id')
          .eq('id', matchId)
          .single();

        if (match?.pre_match_report_id) {
          const { data: report } = await supabase
            .from('pre_match_reports')
            .select('havaya, questions_answers')
            .eq('id', match.pre_match_report_id)
            .single();

          if (report) {
            setHavaya(report.havaya?.split(',') || []);
            setPreMatchAnswers(report.questions_answers || {});
          }
        }
      }
    };

    fetchPlayerProfile();
  }, [matchId]);

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

  const getMotivationalQuote = () => {
    const quotes = [
      "כל משחק הוא הזדמנות להתקדם צעד נוסף קדימה!",
      "ההצלחה שלך היא תוצאה של העבודה הקשה שלך!",
      "אתה משתפר בכל משחק, המשך כך!",
      "תמשיך להאמין בעצמך ובדרך שלך!",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onShare();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        <div 
          id="instagram-summary" 
          className={`bg-gradient-to-br from-primary/10 to-secondary/10 p-6 space-y-6 min-h-[600px]`}
        >
          {/* Logo */}
          <div className="absolute top-4 right-4 opacity-50">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt={playerName} 
                  className="h-16 w-16 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <Trophy className="h-8 w-8 text-yellow-500" />
              )}
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
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
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

          {/* Havaya Section */}
          {havaya.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              {havaya.map((h, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-accent/10 text-accent-foreground text-sm font-medium"
                >
                  {h}
                </span>
              ))}
            </motion.div>
          )}

          {/* Top Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              פעולות מובילות
            </h3>
            {getTopActions().map((action, index) => (
              <Card key={index} className="bg-gradient-to-r from-primary/5 to-secondary/5">
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

          {/* Motivational Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-primary"
          >
            <Quote className="h-5 w-5" />
            <p className="text-sm font-medium italic">{getMotivationalQuote()}</p>
          </motion.div>

          {/* AI Insight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-primary/10 p-4 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">תובנת AI</h3>
            </div>
            <p className="text-sm">{getKeyInsight()}</p>
          </motion.div>

          {/* Share Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center pt-4"
          >
            <Button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-gradient-to-r from-primary to-secondary text-white gap-2 px-6 py-2 rounded-full hover:opacity-90 transition-all"
            >
              <Instagram className="h-5 w-5" />
              {isSharing ? "מכין תמונה..." : "שתף באינסטגרם"}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};