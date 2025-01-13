import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Printer, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PreMatchPreparationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  matchId?: string;
}

export const PreMatchPreparationDialog = ({
  isOpen,
  onClose,
  matchId,
}: PreMatchPreparationDialogProps) => {
  const [preparation, setPreparation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePreparation = async () => {
    if (!matchId) {
      console.error("No match ID provided");
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור טקסט הכנה כרגע",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pre-match-preparation', {
        body: { matchId }
      });

      if (error) {
        throw error;
      }

      if (data?.preparation) {
        setPreparation(data.preparation);
      } else {
        throw new Error("No preparation text received");
      }
    } catch (error) {
      console.error("Error generating preparation:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת טקסט ההכנה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(preparation);
      toast({
        title: "הועתק!",
        description: "הטקסט הועתק ללוח",
      });
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast({
        title: "שגיאה",
        description: "לא הצלחנו להעתיק את הטקסט",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>הכנה למשחק</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                padding: 20px;
                direction: rtl;
              }
            </style>
          </head>
          <body>
            <h1>ההכנה שלי למשחק</h1>
            <div>${preparation.replace(/\n/g, "<br>")}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  useEffect(() => {
    if (isOpen && !preparation) {
      generatePreparation();
    }

    return () => {
      if (!isOpen) {
        setPreparation("");
        setIsLoading(false);
      }
    };
  }, [isOpen, matchId]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="text-2xl font-bold text-right">
          ההכנה שלי למשחק
        </DialogTitle>
        <DialogDescription className="text-right">
          טקסט מותאם אישית להכנה למשחק, מבוסס על התשובות והיעדים שלך
        </DialogDescription>
        
        <ScrollArea className="h-[60vh] w-full pr-4">
          <div className="mt-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">טוען את טקסט ההכנה...</div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-right">
                {preparation}
              </div>
            )}
          </div>
        </ScrollArea>

        {preparation && !isLoading && (
          <div className="flex justify-between items-center gap-4 mt-4">
            <Button onClick={onClose} variant="outline" className="gap-2">
              <X className="h-4 w-4" />
              סגור
            </Button>
            <div className="flex gap-4">
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                העתק
              </Button>
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                הדפס
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};