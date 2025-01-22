import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HavayaQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  examples: string[];
}

export const HavayaQuestionDialog = ({
  open,
  onOpenChange,
  category,
  examples,
}: HavayaQuestionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-right">דוגמאות ל{category}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-4 py-4">
            {examples.map((example, index) => (
              <div
                key={index}
                className="p-3 bg-muted/50 rounded-lg text-right"
              >
                {example}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};