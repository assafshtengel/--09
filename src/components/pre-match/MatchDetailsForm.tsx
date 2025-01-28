import { useState } from "react";
import { MatchQuestionDialog } from "./MatchQuestionDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [answers, setAnswers] = useState<MatchDetails>({
    date: initialData.date,
    opponent: initialData.opponent || "",
    position: initialData.position || "forward",
    match_type: initialData.match_type || "friendly",
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('profiles')
        .select('sport_branches')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const sportBranch = profile?.sport_branches?.[0];

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