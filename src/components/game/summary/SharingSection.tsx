import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { InstagramSummary } from "./InstagramSummary";
import { Download, Instagram, Mail, Share2, User, Image, Copy, Upload } from "lucide-react";
import html2canvas from 'html2canvas';
import { Action } from "@/components/ActionSelector";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SharingSectionProps {
  onEmailSend: (recipientType: 'user' | 'coach') => Promise<void>;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  isSendingEmail: boolean;
  actions: Action[];
  actionLogs: any[];
  insights: string;
  matchId: string | undefined;
  opponent: string | null;
  matchDate: string;
  onCaptionClose: () => void;
}

export const SharingSection = ({
  onEmailSend,
  onShareSocial,
  isSendingEmail,
  actions,
  actionLogs,
  insights,
  matchId,
  opponent,
  matchDate,
  onCaptionClose,
}: SharingSectionProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showInstagramSummary, setShowInstagramSummary] = useState(false);
  const [showPostImage, setShowPostImage] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleShare = async () => {
    setShowInstagramSummary(true);
  };

  const handlePostImage = async () => {
    setShowPostImage(true);
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

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

  const handleInstagramShare = async () => {
    setIsSharing(true);
    try {
      const element = document.getElementById('instagram-post-image');
      if (!element) {
        throw new Error('Instagram post image element not found');
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
          onClose={() => {
            setShowInstagramSummary(false);
            onCaptionClose();
          }}
          onShare={handleInstagramShare}
        />
      )}

      {showPostImage && (
        <Dialog open={showPostImage} onOpenChange={setShowPostImage}>
          <DialogContent className="max-w-4xl">
            <div 
              id="instagram-post-image" 
              className="relative aspect-square bg-gradient-to-br from-primary to-secondary p-8 rounded-lg"
              style={backgroundImage ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col h-full text-white">
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-bold">סיכום משחק</h2>
                    <span className="text-lg">
                      {(() => {
                        try {
                          return format(new Date(matchDate), 'dd/MM/yyyy');
                        } catch (error) {
                          console.error('Error formatting date:', error);
                          return format(new Date(), 'dd/MM/yyyy'); // Fallback to current date
                        }
                      })()}
                    </span>
                  </div>
                  {opponent && (
                    <p className="text-xl">נגד {opponent}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {actions.slice(0, 4).map((action, index) => {
                      const logsForAction = actionLogs.filter(log => log.actionId === action.id);
                      const successCount = logsForAction.filter(log => log.result === "success").length;
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
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">העלה תמונת רקע</label>
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
              <div className="flex justify-end gap-4">
                <Button onClick={() => setShowPostImage(false)} variant="outline">
                  סגור
                </Button>
                <Button onClick={handleInstagramShare}>
                  <Download className="h-4 w-4 ml-2" />
                  שמור תמונה
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};