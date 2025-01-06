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
          <DialogTitle className="text-center text-xl">{actionName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-8 p-6">
          <Button
            variant="outline"
            className="h-20 w-32 rounded-lg border-2 border-red-500 hover:bg-red-500 hover:text-white flex flex-col items-center justify-center gap-2"
            onClick={() => handleResult("failure")}
          >
            <X className="h-8 w-8" />
          </Button>
          <Button
            variant="outline"
            className="h-20 w-32 rounded-lg border-2 border-green-500 hover:bg-green-500 hover:text-white flex flex-col items-center justify-center gap-2"
            onClick={() => handleResult("success")}
          >
            <Check className="h-8 w-8" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};