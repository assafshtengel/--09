import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PreMatchExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const PreMatchExplanationDialog = ({
  isOpen,
  onClose,
  onContinue,
}: PreMatchExplanationDialogProps) => {
  const handleContinue = () => {
    onClose();
    onContinue();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-center mb-4">
            הכנה למשחק
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-right leading-relaxed">
          <p>
            שחקני העל מחליטים איך הם יישחקו עוד לפני שהמשחק מתחיל והמטרה מושגת,
            עוד הרבה לפני שריקת הפתיחה למשחק.
          </p>
          <p>
            כאשר הם עושים זאת, הם לא נותנים לתוצאות ולדברים שקורים במהלך המשחק
            להשפיע על האנרגיות, מצב הרוח וסגנון המשחק שלהם.
          </p>
          <p>
            כעת זה הרגע שלך לנצח את המשחק לפני שריקת הפתיחה ולבחור את השחקן
            שייראו היום.
          </p>
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleContinue}
            className="w-32 bg-primary hover:bg-primary/90"
          >
            סגור
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};