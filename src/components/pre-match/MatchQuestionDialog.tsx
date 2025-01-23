import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CornerDownLeft, ChevronRight, ChevronLeft, Trophy, Handshake, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { he } from "date-fns/locale";

interface MatchQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    label: string;
    type: "text" | "date" | "select";
    options?: { value: string; label: string }[];
  };
  value: string;
  onSubmit: (value: string) => void;
  onBack?: () => void;
  isFirstQuestion?: boolean;
}

export const MatchQuestionDialog = ({
  isOpen,
  onClose,
  question,
  value,
  onSubmit,
  onBack,
  isFirstQuestion = false,
}: MatchQuestionDialogProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    setInputValue("");
    setShowCalendar(false);
    setSelectedOption(null);
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

  const formatDateWithDay = (date: Date) => {
    return format(date, "EEEE, d בMMMM", { locale: he });
  };

  const handleQuickDateSelect = (daysToAdd: number) => {
    const selectedDate = addDays(new Date(), daysToAdd);
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    setInputValue(formattedDate);
    handleSubmit();
  };

  const getMatchTypeIcon = (type: string) => {
    switch (type) {
      case "league":
        return <Trophy className="w-5 h-5" />;
      case "friendly":
        return <Handshake className="w-5 h-5" />;
      case "cup":
        return <Award className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    setSelectedOption(optionValue);
    setInputValue(optionValue);
    
    // If this is the position selection question, submit immediately
    if (question.id === "position") {
      setTimeout(() => {
        onSubmit(optionValue);
      }, 100);
    }
  };

  const renderDateSelection = () => {
    if (showCalendar) {
      return (
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={inputValue ? new Date(inputValue) : undefined}
            onSelect={(date) => {
              if (date) {
                setInputValue(format(date, "yyyy-MM-dd"));
                handleSubmit();
              }
            }}
            className="rounded-md border mx-auto rtl"
          />
          <Button
            variant="ghost"
            onClick={() => setShowCalendar(false)}
            className="w-full"
          >
            חזור לאפשרויות מהירות
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <Button
          onClick={() => handleQuickDateSelect(0)}
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
        >
          היום - {formatDateWithDay(new Date())}
        </Button>
        <Button
          onClick={() => handleQuickDateSelect(1)}
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
        >
          מחר - {formatDateWithDay(addDays(new Date(), 1))}
        </Button>
        <Button
          onClick={() => handleQuickDateSelect(2)}
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary"
        >
          מחרתיים - {formatDateWithDay(addDays(new Date(), 2))}
        </Button>
        <Button
          onClick={() => setShowCalendar(true)}
          variant="outline"
          className="w-full"
        >
          תאריך אחר
        </Button>
      </div>
    );
  };

  const renderOptionButtons = () => {
    return (
      <div className="grid grid-cols-1 gap-3">
        {question.options?.map((option) => (
          <Button
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className={`h-14 relative flex items-center justify-between px-4 ${
              selectedOption === option.value
                ? "bg-primary text-white"
                : "bg-primary/10 hover:bg-primary/20 text-primary"
            }`}
          >
            <span className="flex items-center gap-2">
              {getMatchTypeIcon(option.value)}
              {option.label}
            </span>
            {selectedOption === option.value && (
              <span className="text-white">✓</span>
            )}
          </Button>
        ))}
        
        {/* Show continue button only for position selection and when an option is selected */}
        {question.id === "position" && selectedOption && (
          <Button
            onClick={() => handleSubmit()}
            className="w-full mt-4 bg-primary hover:bg-primary/90"
          >
            המשך
            <ChevronLeft className="w-4 h-4 mr-2" />
          </Button>
        )}
      </div>
    );
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
            {question.type === "date" ? (
              renderDateSelection()
            ) : question.type === "select" ? (
              renderOptionButtons()
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

            {/* Continue button for text input only */}
            {question.type === "text" && (
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                המשך
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </form>
          
          {!isFirstQuestion && (
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                חזור
              </Button>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};