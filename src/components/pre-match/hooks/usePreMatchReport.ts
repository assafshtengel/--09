import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Action } from "@/components/ActionSelector";
import { Json } from "@/integrations/supabase/types";

export const usePreMatchReport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"details" | "form" | "summary">("details");
  const [matchDetails, setMatchDetails] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "",
    position: "forward",
    opponent: "",
  });
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [questionsAnswers, setQuestionsAnswers] = useState<Record<string, string>>({});
  const [havaya, setHavaya] = useState("");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const handleMatchDetailsSubmit = async (details: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          player_id: user.id,
          match_date: details.date,
          opponent: details.opponent,
          player_position: details.position,
          status: 'preview'
        })
        .select()
        .single();

      if (matchError) throw matchError;
      
      setMatchId(match.id);
      setMatchDetails(details);
      setCurrentStep("form");
    } catch (error) {
      console.error('Error saving match details:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת פרטי המשחק",
        variant: "destructive",
      });
    }
  };

  const handleCombinedFormSubmit = async (data: {
    havaya: string;
    actions: Json;
    answers: Record<string, string>;
  }) => {
    if (!matchId) return;

    try {
      setHavaya(data.havaya);
      
      if (Array.isArray(data.actions)) {
        const actions = data.actions
          .filter(isActionJson)
          .map(action => ({
            id: action.id,
            name: action.name,
            isSelected: true,
            goal: action.goal || undefined
          }));
        setSelectedActions(actions);
      }
      
      setQuestionsAnswers(data.answers);
      setCurrentStep("summary");
    } catch (error) {
      console.error('Error saving form data:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הנתונים",
        variant: "destructive",
      });
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return {
    currentStep,
    matchDetails,
    selectedActions,
    questionsAnswers,
    havaya,
    matchId,
    reportId,
    setSelectedActions,
    setQuestionsAnswers,
    setHavaya,
    handleMatchDetailsSubmit,
    handleCombinedFormSubmit,
    handleFinish
  };
};

// Type guard to check if a Json value is an object with specific properties
const isActionJson = (json: Json): json is { id: string; name: string; goal?: string | null } => {
  return typeof json === 'object' && 
         json !== null && 
         'id' in json && 
         'name' in json;
};