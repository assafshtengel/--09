import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Upload, Copy } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from 'html2canvas';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
  matchId?: string;
}

export const InstagramPreMatchSummary = ({
  matchDetails,
  actions,
  havaya,
  onClose,
  onShare,
  matchId,
}: InstagramPreMatchSummaryProps) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        <ScrollArea className="h-[80vh] md:h-[600px]">
          <div 
            id="instagram-pre-match-summary" 
            className="relative min-h-[600px] overflow-hidden"
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={backgroundImage ? {
                backgroundImage: `url(${backgroundImage})`,
              } : {
                background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)'
              }}
            />
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative z-10 p-4">
              <div className="text-white text-right">
                <div className="text-sm opacity-80">
                  {(() => {
                    try {
                      return format(new Date(matchDetails.date), 'dd/MM/yyyy');
                    } catch (error) {
                      console.error('Error formatting date:', error);
                      return format(new Date(), 'dd/MM/yyyy');
                    }
                  })()}
                </div>
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