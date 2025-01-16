import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

interface HavayaItem {
  name: string;
  description: string;
}

interface HavayotPopupProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    name: string;
    description: string;
    havayot: HavayaItem[];
  };
}

export const HavayotPopup = ({ isOpen, onClose, category }: HavayotPopupProps) => {
  const [shuffledHavayot, setShuffledHavayot] = useState<HavayaItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const shuffled = [...category.havayot].sort(() => Math.random() - 0.5).slice(0, 15);
      setShuffledHavayot(shuffled);
    }
  }, [isOpen, category.havayot]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-4 md:p-6">
        <DialogHeader className="space-y-2 mb-4">
          <DialogTitle className="text-xl md:text-2xl text-center">
            איזה שחקן הקבוצה תקבל היום?
          </DialogTitle>
          <div className="text-sm md:text-base">
            <h3 className="font-semibold mb-1">{category.name}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{category.description}</p>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-12rem)] md:h-auto rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
            {shuffledHavayot.map((havaya, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors shadow-sm"
              >
                <h4 className="font-semibold text-base mb-1">{havaya.name}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{havaya.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};