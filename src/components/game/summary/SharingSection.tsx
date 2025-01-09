import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { InstagramSummary } from "./InstagramSummary";
import { Download, Instagram, Mail, Share2, User, Image, Copy } from "lucide-react";
import html2canvas from 'html2canvas';
import { Action } from "@/components/ActionSelector";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SharingSectionProps {
  onEmailSend: (recipientType: 'user' | 'coach') => Promise<void>;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  isSendingEmail: boolean;
  actions: Action[];
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
  const [showPostImage, setShowPostImage] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setShowInstagramSummary(true);
  };

  const handlePostImage = async () => {
    setShowPostImage(true);
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
        scale: 2,
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
              onClick={() => onEmailSend('user')}
              disabled={isSendingEmail}
            >
              <Mail className="h-4 w-4" />
              {isSendingEmail ? "שולח..." : "שלח למייל שלי"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => onEmailSend('coach')}
              disabled={isSendingEmail}
            >
              <User className="h-4 w-4" />
              {isSendingEmail ? "שולח..." : "שלח למאמן"}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handlePostImage}
            >
              <Image className="h-4 w-4" />
              תמונת פוסט
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

      {showPostImage && (
        <Dialog open={showPostImage} onOpenChange={setShowPostImage}>
          <DialogContent className="max-w-4xl">
            <div id="instagram-post-image" className="relative aspect-square bg-gradient-to-br from-primary to-secondary p-8 rounded-lg">
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col h-full text-white">
                <div className="flex-1 space-y-6">
                  <h2 className="text-3xl font-bold">סיכום משחק</h2>
                  {opponent && (
                    <p className="text-xl">נגד {opponent}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {actions.slice(0, 4).map((action, index) => {
                      const actionLogs = actionLogs.filter(log => log.actionId === action.id);
                      const successCount = actionLogs.filter(log => log.result === "success").length;
                      return (
                        <div key={index} className="bg-white/10 p-4 rounded-lg">
                          <p className="font-medium">{action.name}</p>
                          <p className="text-sm opacity-80">{successCount} הצלחות</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="text-lg font-medium">תובנות עיקריות:</p>
                  <p className="opacity-80">{insights.split('\n')[0]}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button onClick={() => setShowPostImage(false)} variant="outline">
                סגור
              </Button>
              <Button onClick={handleInstagramShare}>
                <Download className="h-4 w-4 ml-2" />
                שמור תמונה
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};