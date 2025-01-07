import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ObserverSelectionDialogProps {
  isOpen: boolean;
  onSelect: (type: "parent" | "player") => void;
}

export const ObserverSelectionDialog = ({ isOpen, onSelect }: ObserverSelectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto text-center">
        <DialogHeader>
          <DialogTitle className="text-xl mb-4">מי ממלא את הטופס?</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => onSelect("parent")}
            className="text-lg p-6"
            variant="outline"
          >
            הורה במהלך המשחק (LIVE)
          </Button>
          <Button 
            onClick={() => onSelect("player")}
            className="text-lg p-6"
            variant="outline"
          >
            שחקן בצפייה במשחק (שידור חוזר)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};