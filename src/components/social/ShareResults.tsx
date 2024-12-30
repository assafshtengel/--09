import { Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ShareResultsProps {
  data: {
    title: string;
    description: string;
    stats?: Record<string, number>;
  };
}

export const ShareResults = ({ data }: ShareResultsProps) => {
  const { toast } = useToast();

  const generateShareText = () => {
    let text = `${data.title}\n${data.description}\n`;
    if (data.stats) {
      text += "\nסטטיסטיקות:\n";
      Object.entries(data.stats).forEach(([key, value]) => {
        text += `${key}: ${value}\n`;
      });
    }
    return encodeURIComponent(text);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${generateShareText()}`;
    window.open(url, '_blank');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${generateShareText()}&url=${window.location.href}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      toast({
        title: "הועתק בהצלחה",
        description: "הטקסט הועתק ללוח",
      });
    } catch (err) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק את הטקסט",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          שתף תוצאות
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>שתף את התוצאות</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={shareToFacebook} variant="outline" className="gap-2">
            <Facebook className="h-4 w-4" />
            שתף בפייסבוק
          </Button>
          <Button onClick={shareToTwitter} variant="outline" className="gap-2">
            <Twitter className="h-4 w-4" />
            שתף בטוויטר
          </Button>
          <Button onClick={copyToClipboard} variant="outline">
            העתק קישור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};