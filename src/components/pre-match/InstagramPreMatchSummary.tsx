import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Upload } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from 'html2canvas';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PerformanceChart } from "./components/PerformanceChart";

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
            className="relative min-h-[600px] p-6 space-y-6"
            style={backgroundImage ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {
              background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)'
            }}
          >
            {/* Semi-transparent overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
            
            {/* Content container */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header with match details */}
              <div className="bg-white/90 rounded-lg p-4 shadow-lg backdrop-blur-sm mb-4">
                <div className="text-right">
                  <div className="text-gray-500">{format(new Date(matchDetails.date), 'dd/MM/yyyy')}</div>
                  {matchDetails.opponent && (
                    <div className="text-sm text-gray-600">נגד: {matchDetails.opponent}</div>
                  )}
                </div>
              </div>

              {/* Main content area with flexible spacing */}
              <div className="flex-grow flex">
                {/* Havaya section on the right */}
                {havaya.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-1/3 ml-4"
                  >
                    <div className="bg-white/90 rounded-lg p-4 shadow-lg backdrop-blur-sm h-full">
                      <h3 className="text-lg font-semibold text-right mb-3">הוויות נבחרות</h3>
                      <div className="flex flex-col gap-2">
                        {havaya.map((h, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-r from-primary/10 to-blue-400/10 text-primary px-3 py-2 rounded-full text-sm font-medium shadow-sm text-center"
                          >
                            {h}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Goals section at the bottom */}
                <div className="flex-grow">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-auto"
                  >
                    <div className="bg-white/90 rounded-lg p-4 shadow-lg backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-right mb-3">יעדים למשחק</h3>
                      <PerformanceChart actions={actions} />
                    </div>
                  </motion.div>
                </div>
              </div>
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