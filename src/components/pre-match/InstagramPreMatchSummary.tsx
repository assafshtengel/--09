import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Instagram, Upload } from "lucide-react";
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
}

export const InstagramPreMatchSummary = ({
  matchDetails,
  actions,
  havaya,
  onClose,
  onShare,
}: InstagramPreMatchSummaryProps) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const { toast } = useToast();

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
            className="relative min-h-[600px] overflow-hidden"
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={backgroundImage ? {
                backgroundImage: `url(${backgroundImage})`,
              } : {
                background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)'
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

            {/* Match Details */}
            <div className="relative z-10 p-4">
              <div className="text-white text-right">
                <div className="text-sm opacity-80">{format(new Date(matchDetails.date), 'dd/MM/yyyy')}</div>
                {matchDetails.opponent && (
                  <div className="text-lg font-semibold">נגד: {matchDetails.opponent}</div>
                )}
              </div>
            </div>

            {/* Vertical Havaya Menu */}
            <VerticalHavayaMenu havaya={havaya} />

            {/* Goals Footer */}
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