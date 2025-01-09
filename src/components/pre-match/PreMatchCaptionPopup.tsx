import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    const generateCaption = async () => {
      if (!reportId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('generate-pre-match-instagram-caption', {
          body: { reportId },
        });

        if (error) throw error;
        setCaption(data.caption);
      } catch (error) {
        console.error('Error generating caption:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן ליצור כיתוב לאינסטגרם",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && reportId) {
      generateCaption();
    }
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
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
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