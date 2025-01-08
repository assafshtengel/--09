import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Instagram, Mail, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SharingSectionProps {
  onEmailSend: () => Promise<void>;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  onScreenshot: () => Promise<void>;
  isSendingEmail: boolean;
}

export const SharingSection = ({
  onEmailSend,
  onShareSocial,
  onScreenshot,
  isSendingEmail
}: SharingSectionProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await onScreenshot();
      toast({
        title: "צילום מסך נשמר",
        description: "כעת תוכל לשתף את התמונה באינסטגרם",
      });
      onShareSocial('instagram');
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשתף את הסיכום",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
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
  );
};