import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";
import { useState } from "react";
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
  const [preparation, setPreparation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePreparation = async () => {
    if (!matchId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pre-match-preparation', {
        body: { matchId },
      });

      if (error) throw error;
      setPreparation(data.preparation);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-right">ההכנה שלי למשחק</h2>
          
          {!preparation && !isLoading && (
            <Button 
              onClick={generatePreparation}
              className="w-full"
            >
              צור טקסט הכנה למשחק
            </Button>
          )}

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

              <Button
                onClick={handleCopy}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                העתק טקסט
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};