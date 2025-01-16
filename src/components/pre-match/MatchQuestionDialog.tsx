import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CornerDownLeft } from "lucide-react";

interface MatchQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    label: string;
    type: "text" | "time" | "select" | "date";
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
  const [inputValue, setInputValue] = useState("");

  // Reset input value when question changes
  useEffect(() => {
    setInputValue("");
  }, [question.id]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (inputValue.trim()) {
      onSubmit(inputValue);
    }
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
                  // Automatically submit when a value is selected for select type questions
                  setTimeout(() => handleSubmit(), 100);
                }}
              >
                <SelectTrigger className="w-full text-right h-14">
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
              <div className="relative">
                <Input
                  type={question.type}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-right h-14 pl-12 text-lg"
                  placeholder="הקלד את תשובתך כאן..."
                  required
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                >
                  <CornerDownLeft className="w-5 h-5" />
                  <span className="text-sm">Enter</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};