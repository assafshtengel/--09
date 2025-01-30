import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CornerDownLeft, ChevronRight, ChevronLeft, Trophy, Handshake, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  isFirstQuestion,
}: MatchQuestionDialogProps) => {
  console.log("[MatchQuestionDialog] Rendering with question:", question);
  
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log("[MatchQuestionDialog] Fetching profile data...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('profiles')
        .select('sport_branches')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      console.log("[MatchQuestionDialog] Profile data:", data);
      return data;
    }
  });

  const sportBranch = profile?.sport_branches?.[0];
  console.log("[MatchQuestionDialog] Sport branch:", sportBranch);

  useEffect(() => {
    setInputValue("");
    setShowCalendar(false);
    setSelectedOption(null);
    setError(null);
  }, [question.id]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (question.type === "select" && !selectedOption) {
      setError("אנא בחר אפשרות לפני שתמשיך");
      toast.error("אנא בחר אפשרות לפני שתמשיך");
      return;
    }

    if (inputValue.trim() || selectedOption) {
      onSubmit(selectedOption || inputValue);
      setError(null);
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

  const handleClose = () => {
    onClose();
    navigate("/dashboard");
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
    setError(null);
    
    // Auto-submit for match type if it's basketball
    if (question.id === "match_type" && sportBranch === 'basketball') {
      setTimeout(() => {
        onSubmit(optionValue);
      }, 100);
    } else if (question.id === "position" && sportBranch !== 'basketball') {
      // Auto-submit for position selection after a brief delay (only for football)
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
    // Skip position selection for basketball players
    if (question.id === "position" && sportBranch === 'basketball') {
      console.log("[MatchQuestionDialog] Skipping position selection for basketball");
      onSubmit("not_applicable");
      return null;
    }

    if (question.id === "position") {
      return (
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: "forward", label: "חלוץ" },
            { value: "midfielder", label: "קשר" },
            { value: "defender", label: "מגן" },
            { value: "goalkeeper", label: "שוער" },
            { value: "centerback", label: "בלם" },
            { value: "winger", label: "כנף" },
          ].map((option) => (
            <Button
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              className={`h-14 relative w-full ${
                selectedOption === option.value
                  ? "bg-primary text-white"
                  : "bg-blue-50/50 hover:bg-blue-100/50 text-primary"
              } justify-end px-6 text-lg font-medium`}
            >
              {option.label}
              {selectedOption === option.value && (
                <span className="absolute left-4 text-white">✓</span>
              )}
            </Button>
          ))}
          
          {selectedOption && (
            <Button
              onClick={() => handleSubmit()}
              className="w-full mt-4 bg-primary/20 hover:bg-primary/30 text-primary h-14 text-lg"
            >
              המשך
              <ChevronLeft className="w-5 h-5 mr-2" />
            </Button>
          )}
        </div>
      );
    }

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
        
        {error && (
          <p className="text-destructive text-sm mt-2 text-center">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          
          <div className="mt-4 space-y-2">
            {!isFirstQuestion && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                חזור
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              סגור
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};