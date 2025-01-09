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
  const { toast } = useToast();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    const generateCaption = async () => {
      if (!reportId) return;

      try {
        setIsLoading(true);
        console.log('Starting caption generation for report:', reportId);
        
        // Set a timeout to show error if it takes too long
        timeoutId = setTimeout(() => {
          if (isLoading && isMounted) {
            console.error('Caption generation timeout');
            throw new Error("זמן התגובה ארוך מדי");
          }
        }, 15000); // 15 seconds timeout

        const { data, error } = await supabase.functions.invoke('generate-pre-match-instagram-caption', {
          body: { reportId },
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

        console.log('Caption generated successfully');
        clearTimeout(timeoutId);
        setCaption(data.caption);
      } catch (error) {
        console.error('Error generating caption:', error);
        if (isMounted) {
          toast({
            title: "שגיאה",
            description: error instanceof Error ? error.message : "לא ניתן ליצור כיתוב לאינסטגרם",
            variant: "destructive",
          });
          onClose();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    if (isOpen && reportId) {
      generateCaption();
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
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