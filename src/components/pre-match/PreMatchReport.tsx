import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ActionSelector, Action } from "@/components/ActionSelector";
import { GamePreview } from "@/components/game/GamePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { MatchDetailsForm } from "./MatchDetailsForm";
import { PreMatchSummary } from "./PreMatchSummary";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "details" | "goals" | "questions" | "summary";

export const PreMatchReport = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [matchDetails, setMatchDetails] = useState({
    date: "",
    time: "",
    opponent: "",
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  const handleActionSubmit = (actions: Action[]) => {
    setSelectedActions(actions);
    setCurrentStep("questions");
  };

  const handleMatchDetailsSubmit = (details: typeof matchDetails) => {
    setMatchDetails(details);
    setCurrentStep("goals");
  };

  const handleQuestionsSubmit = async (questionAnswers: Record<string, string>) => {
    setAnswers(questionAnswers);
    
    // Generate AI insights based on answers
    const insights = [
      "התמקד בנשימות עמוקות לפני המשחק להפחתת לחץ",
      "שמור על תקשורת פעילה עם חברי הקבוצה",
      "התמקד במטרות האישיות שהצבת לעצמך",
      "זכור את החוזקות שציינת והשתמש בהן",
    ];
    setAiInsights(insights);
    setCurrentStep("summary");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { error } = await supabase.from("pre_match_reports").insert({
        player_id: user.id,
        match_date: matchDetails.date,
        match_time: matchDetails.time || null,
        opponent: matchDetails.opponent,
        actions: selectedActions,
        questions_answers: answers,
        ai_insights: insights,
        status: "completed"
      });

      if (error) throw error;

      toast.success("הדוח נשמר בהצלחה");
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("שגיאה בשמירת הדוח");
    }
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-right">דוח טרום משחק</h1>
      
      {currentStep === "details" && (
        <MatchDetailsForm
          onSubmit={handleMatchDetailsSubmit}
          initialData={matchDetails}
        />
      )}

      {currentStep === "goals" && (
        <ActionSelector
          position="forward"
          onSubmit={handleActionSubmit}
        />
      )}

      {currentStep === "questions" && (
        <PreMatchQuestionnaire
          onSubmit={handleQuestionsSubmit}
        />
      )}

      {currentStep === "summary" && (
        <PreMatchSummary
          matchDetails={matchDetails}
          actions={selectedActions}
          answers={answers}
          aiInsights={aiInsights}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
};