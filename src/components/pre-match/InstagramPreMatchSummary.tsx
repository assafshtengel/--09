import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Brain, Target, Trophy, Sparkles, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from 'html2canvas';

interface InstagramPreMatchSummaryProps {
  matchDetails: {
    date: string;
    opponent?: string;
  };
  actions: any[];
  havaya: string[];
  onClose: () => void;
  onShare: () => void;
}

export const InstagramPreMatchSummary = ({
  matchDetails,
  actions,
  havaya,
  onClose,
  onShare,
}: InstagramPreMatchSummaryProps) => {
  const [playerName, setPlayerName] = useState<string>("");

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

  const handleShare = async () => {
    try {
      const element = document.getElementById('instagram-pre-match-summary');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pre-match-summary-${format(new Date(matchDetails.date), 'yyyy-MM-dd')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShare();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        <ScrollArea className="h-[80vh] md:h-[600px]">
          <div 
            id="instagram-pre-match-summary" 
            className="bg-white p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-xl font-bold">הטופס חיפה</h2>
              <div className="text-right">
                <div className="text-gray-500">{format(new Date(matchDetails.date), 'dd/MM/yyyy')}</div>
                {matchDetails.opponent && (
                  <div className="text-sm text-gray-600">נגד: {matchDetails.opponent}</div>
                )}
              </div>
            </div>

            {/* Main Circle with Icons */}
            <div className="relative w-full aspect-square max-w-sm mx-auto">
              {/* Center Circle with Player Icon */}
              <div className="absolute inset-1/4 bg-gray-100 rounded-full flex items-center justify-center flex-col gap-2">
                <Activity className="h-12 w-12 text-gray-600" />
                {playerName && (
                  <span className="text-sm font-medium text-gray-600">{playerName}</span>
                )}
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

            {/* Havaya Section */}
            {havaya.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-right mb-3">הוויות נבחרות</h3>
                <div className="flex flex-wrap gap-2 justify-end">
                  {havaya.map((h, index) => (
                    <span 
                      key={index}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Goals Chart */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-right mb-3">יעדים למשחק</h3>
              <div className="grid grid-cols-2 gap-4">
                {actions.slice(0, 4).map((action, index) => (
                  <div 
                    key={index} 
                    className="relative aspect-square rounded-lg overflow-hidden"
                    style={{
                      background: `conic-gradient(${
                        index === 0 ? '#22c55e' : 
                        index === 1 ? '#eab308' : 
                        index === 2 ? '#3b82f6' :
                        '#f97316'
                      } 100%, #f3f4f6 100%)`
                    }}
                  >
                    <div className="absolute inset-2 bg-white rounded-lg flex items-center justify-center p-2">
                      <div className="text-center">
                        <span className="text-sm font-medium block">{action.name}</span>
                        {action.goal && (
                          <span className="text-xs text-gray-500 block mt-1">יעד: {action.goal}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleShare}
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
  );
};