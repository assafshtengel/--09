import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface HavayotExplanationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const HavayotExplanationDialog = ({
  isOpen,
  onClose,
  onContinue,
}: HavayotExplanationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-center mb-4">
            הוויות למשחק
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-right leading-relaxed"
        >
          <p>
            שחקני העל מחליטים איך הם יישחקו עוד לפני שהמשחק מתחיל והמטרה מושגת,
            עוד הרבה לפני שריקת הפתיחה למשחק.
          </p>
          <p>
            כאשר הם עושים זאת, הם לא נותנים לתוצאות ולדברים שקורים במהלך המשחק
            להשפיע על האנרגיות, מצב הרוח וסגנון המשחק שלהם.
          </p>
          <p>
            כעת זה הרגע שלך לנצח את המשחק לפני שריקת הפתיחה ולבחור את ההוויות
            שיובילו אותך להצלחה.
          </p>
        </motion.div>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={onContinue}
            className="w-32 bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            המשך
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};