import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { motion } from "framer-motion";

interface MatchQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    label: string;
    type: "text" | "time" | "select";
    options?: { value: string; label: string; }[];
  };
  value: string;
  onSubmit: (value: string) => void;
}

export const MatchQuestionDialog = ({
  isOpen,
  onClose,
  question,
  value,
  onSubmit,
}: MatchQuestionDialogProps) => {
  const [inputValue, setInputValue] = useState(value);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    onSubmit(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center mb-6">
            {question.label}
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {question.type === "select" ? (
              <Select
                value={inputValue}
                onValueChange={(value) => {
                  setInputValue(value);
                  handleSubmit();
                }}
              >
                <SelectTrigger className="w-full text-right">
                  <SelectValue placeholder="בחר אפשרות" />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={question.type}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-right"
                placeholder="הקלד את תשובתך כאן..."
                required
              />
            )}
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};