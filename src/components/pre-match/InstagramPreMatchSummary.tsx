import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AICaptionPopup } from "./components/AICaptionPopup";
import { Activity, Brain, Target, Trophy, Sparkles, Instagram, Text } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { VerticalHavayaMenu } from "./components/VerticalHavayaMenu";
import { GoalsFooter } from "./components/GoalsFooter";

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
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [showAICaption, setShowAICaption] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setPlayerName(profile.full_name);
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

      // Load background image before taking screenshot
      if (backgroundImage) {
        const img = new Image();
        img.src = backgroundImage;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
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

      setShowAICaption(true);
      onShare();
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "שגיאה ביצירת התמונה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
          <ScrollArea className="h-[80vh] md:h-[600px]">
            <div 
              id="instagram-pre-match-summary" 
              className="relative min-h-[600px] overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={backgroundImage ? {
                  backgroundImage: `url(${backgroundImage})`,
                } : {
                  background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)'
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

              <div className="relative z-10 p-4">
                <div className="text-white text-right">
                  <div className="text-sm opacity-80">{format(new Date(matchDetails.date), 'dd/MM/yyyy')}</div>
                  {matchDetails.opponent && (
                    <div className="text-lg font-semibold">נגד: {matchDetails.opponent}</div>
                  )}
                  {playerName && (
                    <div className="text-xl font-bold mt-2">{playerName}</div>
                  )}
                </div>
              </div>

              <VerticalHavayaMenu havaya={havaya} />
              <GoalsFooter actions={actions} />
            </div>

            <div className="flex justify-center gap-2 pt-4">
              <Button
                onClick={handleShare}
                className="bg-gradient-to-r from-primary to-secondary text-white gap-2 px-6 py-2 rounded-full hover:opacity-90 transition-all"
              >
                <Instagram className="h-5 w-5" />
                שתף באינסטגרם
              </Button>
              
              <Button
                onClick={() => setShowAICaption(true)}
                className="bg-gradient-to-r from-primary to-secondary text-white gap-2 px-6 py-2 rounded-full hover:opacity-90 transition-all"
              >
                <Text className="h-5 w-5" />
                טקסט לאינסטגרם
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AICaptionPopup
        isOpen={showAICaption}
        onClose={() => setShowAICaption(false)}
        matchId={matchDetails.date}
      />
    </>
  );
};