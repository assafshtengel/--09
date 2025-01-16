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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center mb-4">
            איזה שחקן הקבוצה תקבל היום?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
            <p className="text-gray-600 leading-relaxed">{category.description}</p>
          </div>
          <ScrollArea className="h-[60vh] rounded-md border p-4">
            <div className="space-y-6">
              {shuffledHavayot.map((havaya, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                >
                  <h4 className="font-semibold text-lg mb-2">{havaya.name}</h4>
                  <p className="text-gray-600">{havaya.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};