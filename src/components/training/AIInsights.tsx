import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface AIInsightsProps {
  insights: string;
}

export const AIInsights = ({ insights }: AIInsightsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (insights) {
      setIsOpen(true);
    }
  }, [insights]);

  if (!insights) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">
            תובנות מקצועיות
          </DialogTitle>
        </DialogHeader>
        <div className="text-right whitespace-pre-line mt-4">{insights}</div>
      </DialogContent>
    </Dialog>
  );
};