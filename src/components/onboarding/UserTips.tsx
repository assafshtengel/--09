import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Tip {
  id: number;
  title: string;
  description: string;
}

const tips: Tip[] = [
  {
    id: 1,
    title: "ברוכים הבאים למערכת!",
    description: "כאן תוכלו לנהל את הפעילות הספורטיבית שלכם, לעקוב אחר התקדמות ולקבל משוב."
  },
  {
    id: 2,
    title: "דוח טרום משחק",
    description: "לפני כל משחק, מלאו דוח טרום משחק כדי להגדיר יעדים ולהתכונן בצורה הטובה ביותר."
  },
  {
    id: 3,
    title: "מעקב אחר ביצועים",
    description: "בלוח הבקרה תוכלו לראות סטטיסטיקות וגרפים שמציגים את ההתקדמות שלכם לאורך זמן."
  }
];

export const UserTips = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const hasSeenTips = localStorage.getItem('hasSeenTips');
    if (!hasSeenTips) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenTips', 'true');
    setIsOpen(false);
  };

  const currentTip = tips[currentTipIndex];

  const handleNext = () => {
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentTip.title}</DialogTitle>
          <DialogDescription>
            {currentTip.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleClose}>
            דלג
          </Button>
          <Button onClick={handleNext}>
            {currentTipIndex < tips.length - 1 ? "הבא" : "סיום"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};