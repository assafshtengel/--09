import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName: string;
  onResult: (result: "success" | "failure") => void;
}

export const ActionModal = ({ isOpen, onClose, actionName, onResult }: ActionModalProps) => {
  const handleResult = (result: "success" | "failure") => {
    onResult(result);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-right">{actionName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-4 p-4">
          <Button
            variant="outline"
            className="h-16 w-16 rounded-full border-2 border-green-500 hover:bg-green-500 hover:text-white"
            onClick={() => handleResult("success")}
          >
            <Check className="h-8 w-8" />
          </Button>
          <Button
            variant="outline"
            className="h-16 w-16 rounded-full border-2 border-red-500 hover:bg-red-500 hover:text-white"
            onClick={() => handleResult("failure")}
          >
            <X className="h-8 w-8" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};