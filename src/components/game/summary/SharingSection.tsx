import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Instagram, Mail, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { InstagramSummary } from "./InstagramSummary";
import html2canvas from 'html2canvas';

interface SharingSectionProps {
  onEmailSend: () => Promise<void>;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  onScreenshot: () => Promise<void>;
  isSendingEmail: boolean;
  actions: any[];
  actionLogs: any[];
  insights: string;
  matchId: string | undefined;
  opponent: string | null;
}

export const SharingSection = ({
  onEmailSend,
  onShareSocial,
  isSendingEmail,
  actions,
  actionLogs,
  insights,
  matchId,
  opponent
}: SharingSectionProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showInstagramSummary, setShowInstagramSummary] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setShowInstagramSummary(true);
  };

  const handleInstagramShare = async () => {
    setIsSharing(true);
    try {
      const element = document.getElementById('instagram-summary');
      if (!element) {
        throw new Error('Instagram summary element not found');
      }

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        useCORS: true,
        scale: 2, // Higher quality
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `game-summary-${new Date().toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "צילום מסך נשמר",
        description: "כעת תוכל לשתף את התמונה באינסטגרם",
      });
      onShareSocial('instagram');
    } catch (error) {
      console.error('Error taking screenshot:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשתף את הסיכום",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
      setShowInstagramSummary(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-6 w-6" />
            שיתוף ושמירה
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleShare}
              disabled={isSharing}
            >
              <Instagram className="h-4 w-4" />
              שתף באינסטגרם
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={onEmailSend}
              disabled={isSendingEmail}
            >
              <Mail className="h-4 w-4" />
              {isSendingEmail ? "שולח..." : "שלח למייל"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={onScreenshot}
            >
              <Download className="h-4 w-4" />
              שמור צילום מסך
            </Button>
          </div>
        </CardContent>
      </Card>

      {showInstagramSummary && (
        <InstagramSummary
          actions={actions}
          actionLogs={actionLogs}
          insights={insights}
          matchId={matchId}
          opponent={opponent}
          onClose={() => setShowInstagramSummary(false)}
          onShare={handleInstagramShare}
        />
      )}
    </>
  );
};