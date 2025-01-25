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
            כיצד אתה רוצה להיראות ועל מה לשים דגש מבחינה מקצועית במשחק?
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-right leading-relaxed"
        >
          <p>
            המחקר מוכיח שכאשר שחקן כותב את המטרות והדגשים שלו בעצמו, המחויבות שלו לביצוע עולה משמעותית. הכתיבה האישית מחזקת את המוטיבציה והחיבור הרגשי למטרות.
          </p>
          <p className="text-sm text-blue-600">
            מוזמן לראות דוגמאות להוויות מקצועיות בלחיצה על הכפתור.
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