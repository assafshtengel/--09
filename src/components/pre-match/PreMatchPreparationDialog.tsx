import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Copy, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [showSocialShareDialog, setShowSocialShareDialog] = useState(false);
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pre-match-preparation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ matchId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate preparation text");
      }

      const data = await response.json();
      if (data.preparation) {
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

  const cleanupAndClose = () => {
    setPreparation("");
    setIsLoading(false);
    setShowSocialShareDialog(false);
    onClose();
  };

  const handleClose = () => {
    if (preparation) {
      setShowSocialShareDialog(true);
    } else {
      cleanupAndClose();
    }
  };

  const handleSocialShareResponse = async (share: boolean) => {
    if (share) {
      await handleCopy();
      window.open("https://www.instagram.com/", "_blank");
    }
    cleanupAndClose();
  };

  useEffect(() => {
    if (isOpen && !preparation) {
      generatePreparation();
    }

    return () => {
      if (!isOpen) {
        setPreparation("");
        setIsLoading(false);
        setShowSocialShareDialog(false);
      }
    };
  }, [isOpen, matchId]);

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-2xl font-bold text-right">
            ההכנה שלי למשחק
          </DialogTitle>
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
          {preparation && !isLoading && (
            <div className="flex justify-end gap-4 mt-4">
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                העתק
              </Button>
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                הדפס
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSocialShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              שיתוף ברשתות חברתיות
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              האם תרצה לשתף את טקסט ההכנה באינסטגרם?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse justify-start gap-2">
            <AlertDialogAction onClick={() => handleSocialShareResponse(true)}>
              כן, שתף באינסטגרם
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => handleSocialShareResponse(false)}>
              לא, סגור
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};