import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryType {
  name: string;
  description: string;
  key: "professional" | "mental" | "emotional" | "social";
  havayot: Array<{
    name: string;
    description: string;
  }>;
}

interface HavayotPopupProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryType;
}

export const HavayotPopup = ({ isOpen, onClose, category }: HavayotPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-right">{category.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] w-full pr-4">
          <div className="space-y-4">
            <p className="text-gray-600 text-right">{category.description}</p>
            
            <div className="grid gap-4">
              {category.havayot.map((havaya, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg space-y-2"
                >
                  <h3 className="font-medium text-right">{havaya.name}</h3>
                  <p className="text-sm text-gray-600 text-right">{havaya.description}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};