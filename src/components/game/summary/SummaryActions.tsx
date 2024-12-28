import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface SummaryActionsProps {
  gamePhase: "halftime" | "ended";
  isSendingEmail: boolean;
  onSubmit: () => void;
  onSendEmail: () => void;
  onShareSocial: (platform: 'facebook' | 'instagram') => void;
  onScreenshot: () => void;
  onClose: () => void;
  onContinueGame?: () => void;
}

export const SummaryActions = ({
  gamePhase,
  isSendingEmail,
  onSubmit,
  onSendEmail,
  onShareSocial,
  onScreenshot,
  onClose,
  onContinueGame
}: SummaryActionsProps) => {
  return (
    <div className="flex flex-wrap justify-end gap-4">
      {gamePhase === "halftime" && onContinueGame && (
        <Button onClick={() => {
          onContinueGame();
          onClose();
        }} variant="default">
          המשך למחצית שנייה
        </Button>
      )}
      
      {gamePhase === "ended" && (
        <>
          <Button 
            onClick={onSubmit}
            variant="default"
          >
            שמור וסיים
          </Button>
          <Button 
            onClick={onSendEmail} 
            variant="outline"
            disabled={isSendingEmail}
          >
            {isSendingEmail ? "שולח..." : "שלח למייל"}
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => onShareSocial('facebook')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              שתף בפייסבוק
            </Button>
            <Button
              onClick={() => onShareSocial('instagram')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              שתף באינסטגרם
            </Button>
          </div>
        </>
      )}
      
      <Button onClick={onScreenshot} variant="outline">
        שמור צילום מסך
      </Button>
      <Button onClick={onClose} variant="outline">
        סגור
      </Button>
    </div>
  );
};