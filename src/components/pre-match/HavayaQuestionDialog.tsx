import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface HavayaQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    name: string;
    description: string;
  };
  value: string;
  onSubmit: (value: string) => void;
  onShowHavayot: () => void;
  onBack?: () => void;
  isFirstQuestion?: boolean;
}

export const HavayaQuestionDialog = ({
  isOpen,
  onClose,
  category,
  value,
  onSubmit,
  onShowHavayot,
  onBack,
  isFirstQuestion = false,
}: HavayaQuestionDialogProps) => {
  const [inputValue, setInputValue] = useState(value);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (inputValue.trim()) {
      onSubmit(inputValue);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-center mb-4">
            {category.name}
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <p className="text-right text-gray-600 leading-relaxed">
            {category.description}
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={onShowHavayot}
                className="w-full flex items-center gap-2 justify-center py-2 hover:bg-gray-100"
              >
                <BookOpen className="h-4 w-4" />
                צפה בהוויות לדוגמה
              </Button>
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full text-right resize-none min-h-[100px]"
                placeholder={`רשום את ההוויה שאיתה אתה מגיע למשחק בתחום ה${category.name}`}
              />
            </div>
            <div className="flex justify-between items-center">
              {!isFirstQuestion && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="h-4 w-4" />
                  חזור
                </Button>
              )}
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 mr-auto flex items-center gap-2"
              >
                המשך
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};