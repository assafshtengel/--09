import { Button } from "@/components/ui/button";
import { Camera, Facebook, Home, Instagram, Mail, Printer, Send } from "lucide-react";

interface PreMatchActionsProps {
  onPrint: () => void;
  onScreenshot: () => void;
  onSendEmail: (recipient: 'coach' | 'user') => void;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  onNavigateHome: () => void;
  isSending: boolean;
}

export const PreMatchActions = ({
  onPrint,
  onScreenshot,
  onSendEmail,
  onShareSocial,
  onNavigateHome,
  isSending
}: PreMatchActionsProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-end">
      <Button onClick={onPrint} variant="outline" className="gap-2">
        <Printer className="h-4 w-4" />
        הדפס
      </Button>
      <Button onClick={onScreenshot} variant="outline" className="gap-2">
        <Camera className="h-4 w-4" />
        צלם מסך
      </Button>
      <Button 
        onClick={() => onSendEmail('coach')} 
        variant="outline" 
        disabled={isSending}
        className="gap-2"
      >
        <Send className="h-4 w-4" />
        {isSending ? "שולח..." : "שלח למאמן"}
      </Button>
      <Button 
        onClick={() => onSendEmail('user')} 
        variant="outline" 
        disabled={isSending}
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        שלח למייל שלי
      </Button>
      <Button
        onClick={() => onShareSocial('facebook')}
        variant="outline"
        className="gap-2"
      >
        <Facebook className="h-4 w-4" />
        שתף בפייסבוק
      </Button>
      <Button
        onClick={() => onShareSocial('instagram')}
        variant="outline"
        className="gap-2"
      >
        <Instagram className="h-4 w-4" />
        שתף באינסטגרם
      </Button>
      <Button
        onClick={onNavigateHome}
        variant="outline"
        className="gap-2"
      >
        <Home className="h-4 w-4" />
        חזרה לדף הבית
      </Button>
    </div>
  );
};