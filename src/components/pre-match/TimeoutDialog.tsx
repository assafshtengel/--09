import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface TimeoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimeoutDialog = ({ isOpen, onClose }: TimeoutDialogProps) => {
  const handleExternalClick = () => {
    window.open("https://did.li/Kld6q", "_blank");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <div className="text-center space-y-6 p-4">
          <p className="text-lg">
            בשל בעיה בשרת, נא ללחוץ על הקישור הזה ליצירת תכנון יום באתר החיצוני.
          </p>
          
          <Button
            onClick={handleExternalClick}
            className="w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2"
            size="lg"
          >
            <span>לחץ כאן ליצירת תכנון לפני משחק באתר החיצוני</span>
            <ExternalLink className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};