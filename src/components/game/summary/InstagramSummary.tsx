import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Share2, Instagram, Target, Activity, Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AICaptionPopup } from "./AICaptionPopup";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
          <ScrollArea className="h-[80vh] md:h-[600px]">
            <div 
              id="instagram-summary" 
              className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">הטופס חיפה</h2>
                <span className="text-gray-500">{format(new Date(), 'dd/MM/yyyy')}</span>
              </div>

              {/* Main Circle with Icons */}
              <div className="relative w-full aspect-square max-w-sm mx-auto my-8">
                {/* Center Circle */}
                <div className="absolute inset-1/4 bg-gray-200 rounded-full flex items-center justify-center">
                  <Activity className="h-12 w-12 text-gray-600" />
                </div>
                
                {/* Surrounding Icons */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-green-100 p-3 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-blue-100 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-yellow-100 p-3 rounded-full">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-orange-100 p-3 rounded-full">
                  <Sparkles className="h-6 w-6 text-orange-600" />
                </div>
              </div>

              {/* Performance Chart */}
              <div className="mt-8">
                <div className="flex justify-center gap-4">
                  {getTopActions().map((action, index) => (
                    <div 
                      key={index} 
                      className="flex-1 text-center"
                      style={{
                        background: `conic-gradient(${
                          index === 0 ? 'green' : 
                          index === 1 ? 'yellow' : 
                          'red'
                        } ${action.rate}%, transparent ${action.rate}%, transparent 100%)`
                      }}
                    >
                      <div className="aspect-square rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{action.name}</span>
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