import { useState } from "react";
import { MatchQuestionDialog } from "./MatchQuestionDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MatchDetails {
  date: string;
  opponent?: string;
  location?: string;
  position?: string;
  match_type?: string;
}

interface MatchDetailsFormProps {
  onSubmit: (details: MatchDetails) => void;
  initialData: MatchDetails;
}

export const MatchDetailsForm = ({ onSubmit, initialData }: MatchDetailsFormProps) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [answers, setAnswers] = useState<MatchDetails>({
    date: initialData.date,
    opponent: initialData.opponent || "",
    position: initialData.position || "forward",
    match_type: initialData.match_type || "friendly",
  });

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user");
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('sport_branches')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <p className="text-red-500">שגיאה בטעינת הנתונים</p>
        <Button onClick={() => navigate("/dashboard")}>חזור לדף הבית</Button>
      </div>
    );
  }

  const sportBranch = profile?.sport_branches?.[0];

  // Define questions based on sport branch
  const QUESTIONS = [
    {
      id: "date",
      label: "מתי המשחק?",
      type: "date" as const,
    },
    {
      id: "opponent",
      label: "נגד מי אתם משחקים?",
      type: "text" as const,
    },
    {
      id: "match_type",
      label: "מהו סוג המשחק?",
      type: "select" as const,
      options: [
        { value: "league", label: "ליגה" },
        { value: "friendly", label: "ידידות" },
        { value: "cup", label: "גביע" },
      ],
    },
    // Only include position question for football
    ...(sportBranch !== 'basketball' ? [{
      id: "position",
      label: "באיזה תפקיד תשחק במשחק?",
      type: "select" as const,
      options: [
        { value: "forward", label: "חלוץ" },
        { value: "midfielder", label: "קשר" },
        { value: "defender", label: "מגן" },
        { value: "goalkeeper", label: "שוער" },
        { value: "centerback", label: "בלם" },
        { value: "winger", label: "כנף" },
      ],
    }] : []),
  ];

  const handleQuestionSubmit = (value: string) => {
    if (!QUESTIONS[currentQuestionIndex]) return;
    
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        onSubmit(answers);
        setIsTransitioning(false);
      }, 100);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Only render if we have valid questions
  if (!QUESTIONS[currentQuestionIndex]) {
    return null;
  }

  return (
    <div className="space-y-4">
      <MatchQuestionDialog
        isOpen={currentQuestionIndex < QUESTIONS.length && !isTransitioning}
        onClose={() => {}}
        question={QUESTIONS[currentQuestionIndex]}
        value={answers[QUESTIONS[currentQuestionIndex].id as keyof MatchDetails] || ""}
        onSubmit={handleQuestionSubmit}
        onBack={handleBack}
        isFirstQuestion={currentQuestionIndex === 0}
      />
    </div>
  );
};