import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Instagram, Upload } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from 'html2canvas';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

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
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('player-media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('player-media')
        .getPublicUrl(filePath);

      setBackgroundImage(publicUrl);
      toast({
        title: "התמונה הועלתה בהצלחה",
        description: "התמונה תשמש כרקע לתמונת האינסטגרם",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "שגיאה בהעלאת התמונה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

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
            className="relative min-h-[600px] p-6 space-y-6 bg-gradient-to-br from-purple-100 to-blue-50"
            style={backgroundImage ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            {/* Semi-transparent overlay for better text readability */}
            {backgroundImage && (
              <div className="absolute inset-0 bg-white/80" />
            )}
            
            {/* Content container */}
            <div className="relative z-10">
              {/* Header with Player Name */}
              <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {playerName}
                  </h2>
                  <div className="text-right">
                    <div className="text-gray-500">{format(new Date(matchDetails.date), 'dd/MM/yyyy')}</div>
                    {matchDetails.opponent && (
                      <div className="text-sm text-gray-600">נגד: {matchDetails.opponent}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Goals Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                  <h3 className="text-lg font-semibold text-right mb-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    יעדים למשחק
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {actions.map((action, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg shadow-sm"
                      >
                        <div className="text-center">
                          <span className="font-medium text-primary">{action.name}</span>
                          {action.goal && (
                            <span className="block mt-1 text-sm text-gray-600">יעד: {action.goal}</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Havaya Section */}
              {havaya.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6"
                >
                  <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <h3 className="text-lg font-semibold text-right mb-3">הוויות נבחרות</h3>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {havaya.map((h, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-primary/10 to-blue-400/10 text-primary px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                        >
                          {h}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="p-4 space-y-4 bg-white border-t">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">העלה תמונת רקע</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="text-sm"
                />
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white gap-2"
            >
              <Instagram className="h-5 w-5" />
              שתף באינסטגרם
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};