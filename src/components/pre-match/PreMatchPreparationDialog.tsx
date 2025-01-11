import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [preparation, setPreparation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSocialShareDialog, setShowSocialShareDialog] = useState(false);
  const { toast } = useToast();

  const generatePreparation = async () => {
    if (!matchId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה משחק",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Generating preparation for match:', matchId);
      const { data, error } = await supabase.functions.invoke('generate-pre-match-preparation', {
        body: { matchId },
      });

      if (error) throw error;
      
      if (data?.preparation) {
        setPreparation(data.preparation);
      } else {
        throw new Error('No preparation text received');
      }
    } catch (error) {
      console.error('Error generating preparation text:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור את טקסט ההכנה",
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
        title: "הטקסט הועתק",
        description: "הטקסט הועתק ללוח",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק את הטקסט",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
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
            <div>${preparation}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleClose = () => {
    setShowSocialShareDialog(true);
  };

  const handleSocialShareResponse = async (share: boolean) => {
    setShowSocialShareDialog(false);
    if (share) {
      await handleCopy();
      window.open('https://www.instagram.com/', '_blank');
    }
    setPreparation(""); // Reset the preparation text
    onClose(); // Call the parent's onClose function
  };

  const handleDialogClose = () => {
    if (preparation) {
      handleClose();
    } else {
      onClose();
    }
  };

  // Generate preparation text when dialog opens
  useEffect(() => {
    if (isOpen && !preparation) {
      generatePreparation();
    }
  }, [isOpen, matchId]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-2xl font-bold text-right">ההכנה שלי למשחק</DialogTitle>
          
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center py-8 text-gray-500">
                מכין את הטקסט...
              </div>
            )}

            {preparation && (
              <div className="space-y-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="whitespace-pre-line text-right">
                    {preparation}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    העתק טקסט
                  </Button>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    הדפס
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="default"
                  >
                    סגור
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSocialShareDialog} onOpenChange={setShowSocialShareDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>שיתוף ברשתות חברתיות</AlertDialogTitle>
            <AlertDialogDescription>
              האם תרצה לשתף את הטקסט ברשתות החברתיות?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleSocialShareResponse(false)}>לא</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSocialShareResponse(true)}>כן</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};