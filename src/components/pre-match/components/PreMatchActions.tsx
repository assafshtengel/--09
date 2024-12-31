import { Button } from "@/components/ui/button";
import { Send, Mail, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PreMatchActionsProps {
  onEmailSend: () => Promise<void>;
  onPrint: () => Promise<void>;
  onWhatsAppShare: () => Promise<void>;
  isEmailSending: boolean;
  isPrinting: boolean;
  isWhatsAppSending: boolean;
}

export const PreMatchActions = ({
  onEmailSend,
  onPrint,
  onWhatsAppShare,
  isEmailSending,
  isPrinting,
  isWhatsAppSending
}: PreMatchActionsProps) => {
  return (
    <div className="flex flex-wrap justify-end gap-4 mt-6">
      <Button 
        onClick={onEmailSend}
        variant="outline"
        disabled={isEmailSending}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        {isEmailSending ? "שולח..." : "שלח למייל"}
      </Button>

      <Button 
        onClick={onPrint}
        variant="outline"
        disabled={isPrinting}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? "מדפיס..." : "הדפס"}
      </Button>

      <Button 
        onClick={onWhatsAppShare}
        variant="outline"
        disabled={isWhatsAppSending}
        className="flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        {isWhatsAppSending ? "שולח..." : "שלח לוואטסאפ"}
      </Button>
    </div>
  );
};