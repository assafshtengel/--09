import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ObserverLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observerToken: string | null;
}

export const ObserverLinkDialog = ({ open, onOpenChange, observerToken }: ObserverLinkDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!observerToken) return null;

  const observerLink = `${window.location.origin}/observe/${observerToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(observerLink);
      setCopied(true);
      toast({
        title: "הקישור הועתק",
        description: "הקישור הועתק ללוח",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק את הקישור",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>קישור למשקיף</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Input
            readOnly
            value={observerLink}
            className="ltr:text-left rtl:text-right"
          />
          <Button 
            type="button" 
            size="icon" 
            onClick={handleCopy}
            variant="outline"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          שתף את הקישור הזה עם המשקיף כדי שיוכל לעקוב אחר המשחק בזמן אמת
        </p>
      </DialogContent>
    </Dialog>
  );
};