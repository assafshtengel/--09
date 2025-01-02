import { Button } from "@/components/ui/button";
import { Mail, Home, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SummaryActionsProps {
  onEmailSend: () => Promise<void>;
  onPrint: () => Promise<void>;
  isEmailSending: boolean;
  isPrinting: boolean;
}

export const SummaryActions = ({
  onEmailSend,
  onPrint,
  isEmailSending,
  isPrinting
}: SummaryActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap justify-end gap-4">
      <Button 
        onClick={onEmailSend} 
        variant="outline"
        disabled={isEmailSending}
        className="flex items-center gap-2"
      >
        <Mail className="h-4 w-4" />
        {isEmailSending ? "שולח..." : "שלח למייל המאמן"}
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
        onClick={() => navigate("/dashboard")}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <Home className="h-4 w-4" />
        חזור לדף הבית
      </Button>
    </div>
  );
};