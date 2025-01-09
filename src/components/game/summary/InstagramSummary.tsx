import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AICaptionPopup } from "./AICaptionPopup";
import { Activity, Brain, Target, Trophy, Sparkles, Instagram } from "lucide-react";
import { motion } from "framer-motion";

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
  const [showCaptionPopup, setShowCaptionPopup] = useState(false);

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setPlayerName(profile.full_name || "");
      }
    };

    fetchPlayerProfile();
  }, []);

  useEffect(() => {
    setShowCaptionPopup(true);
  }, []);

  const getTopActions = () => {
    return actions.slice(0, 4).map(action => {
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

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
          <ScrollArea className="h-[80vh] md:h-[600px]">
            <div 
              id="instagram-summary" 
              className="bg-white p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-bold">הטופס חיפה</h2>
                <span className="text-gray-500">{format(new Date(), 'dd/MM/yyyy')}</span>
              </div>

              {/* Main Circle with Icons */}
              <div className="relative w-full aspect-square max-w-sm mx-auto">
                {/* Center Circle with Player Icon */}
                <div className="absolute inset-1/4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Activity className="h-12 w-12 text-gray-600" />
                </div>
                
                {/* Surrounding Icons */}
                <motion.div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 bg-green-100 p-3 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Target className="h-6 w-6 text-green-600" />
                </motion.div>
                <motion.div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-100 p-3 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Brain className="h-6 w-6 text-blue-600" />
                </motion.div>
                <motion.div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-yellow-100 p-3 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </motion.div>
                <motion.div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-orange-100 p-3 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Sparkles className="h-6 w-6 text-orange-600" />
                </motion.div>
              </div>

              {/* Performance Chart */}
              <div className="mt-8">
                <div className="grid grid-cols-2 gap-4">
                  {getTopActions().map((action, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square rounded-lg overflow-hidden"
                      style={{
                        background: `conic-gradient(${
                          index === 0 ? '#22c55e' : 
                          index === 1 ? '#eab308' : 
                          index === 2 ? '#3b82f6' :
                          '#f97316'
                        } ${action.rate}%, #f3f4f6 ${action.rate}%, #f3f4f6 100%)`
                      }}
                    >
                      <div className="absolute inset-2 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-center">{action.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={onShare}
                  className="bg-gradient-to-r from-primary to-secondary text-white gap-2 px-6 py-2 rounded-full hover:opacity-90 transition-all"
                >
                  <Instagram className="h-5 w-5" />
                  שתף באינסטגרם
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AICaptionPopup
        isOpen={showCaptionPopup}
        onClose={() => setShowCaptionPopup(false)}
        matchId={matchId}
      />
    </>
  );
};