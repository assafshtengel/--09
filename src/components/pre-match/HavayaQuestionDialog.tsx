import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface HavayaQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  onViewTraits: () => void;
}

export const HavayaQuestionDialog = ({
  open,
  onOpenChange,
  category,
  onViewTraits,
}: HavayaQuestionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">
            {category}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            onClick={onViewTraits}
            variant="outline"
            className="w-full flex items-center gap-2 justify-center"
          >
            <Eye className="h-4 w-4" />
            צפה בהוויות לדוגמה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};