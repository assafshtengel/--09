import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PreMatchCaptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string | undefined;
}

export const PreMatchCaptionPopup = ({ isOpen, onClose, reportId }: PreMatchCaptionPopupProps) => {
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const generateCaption = async () => {
      if (!reportId) return;

      try {
        setIsLoading(true);
        setError(null);
        console.log('Starting caption generation for report:', reportId);

        const { data, error } = await supabase.functions.invoke('generate-pre-match-instagram-caption', {
          body: { 
            reportId,
            title: "ההכנה שלי למשחק" // Adding the new title here
          },
        });

        if (!isMounted) return;

        if (error) {
          console.error('Supabase function error:', error);
          throw error;
        }
        
        if (!data?.caption) {
          console.error('No caption received from server');
          throw new Error("לא התקבל תוכן מהשרת");
        }

        console.log('Caption generated successfully:', data.caption);
        setCaption(data.caption);
      } catch (error) {
        console.error('Error generating caption:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : "לא ניתן ליצור כיתוב לאינסטגרם");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isOpen && reportId) {
      generateCaption();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, reportId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast({
        title: "הטקסט הועתק",
        description: "כעת תוכל להדביק את הטקסט באינסטגרם",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק את הטקסט",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            כיתוב לאינסטגרם
          </DialogTitle>
          <DialogDescription>
            הכיתוב נוצר על בסיס היעדים וההוויות שבחרת למשחק
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">יוצר כיתוב מותאם אישית...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-lg text-center space-y-2">
              <p className="text-destructive font-medium">שגיאה בעת יצירת הכיתוב</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                onClick={onClose}
                variant="outline"
                className="mt-2"
              >
                סגור
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-lg whitespace-pre-line text-right">
                {caption}
              </div>
              
              <Button
                onClick={handleCopy}
                className="w-full flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                העתק טקסט
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};