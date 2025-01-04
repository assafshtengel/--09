import { useState } from "react";
import { HavayaSelector } from "./HavayaSelector";
import { ActionSelector } from "../ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { motion } from "framer-motion";
import { Json } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";

interface PreMatchCombinedFormProps {
  position: string;
  onSubmit: (data: {
    havaya: string;
    actions: Json;
    answers: Record<string, string>;
  }) => void;
}

interface Action {
  id: string;
  name: string;
  isSelected: boolean;
  goal?: string;
}

// Type guard to check if a Json value has the required Action properties
const isActionJson = (json: Json): json is { id: string; name: string; goal?: string } => {
  return typeof json === 'object' && 
         json !== null && 
         'id' in json && 
         'name' in json;
};

export const PreMatchCombinedForm = ({ position, onSubmit }: PreMatchCombinedFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [havaya, setHavaya] = useState("");
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleActionsSubmit = (actionsJson: Json) => {
    if (Array.isArray(actionsJson)) {
      const actions = actionsJson
        .filter(isActionJson)
        .map(action => ({
          id: action.id,
          name: action.name,
          isSelected: true,
          goal: action.goal
        }));
      setSelectedActions(actions);
    }
  };

  const handleSubmit = async () => {
    if (selectedActions.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא בחר לפחות פעולה אחת",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(answers).length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא ענה על השאלות",
        variant: "destructive",
      });
      return;
    }

    try {
      const actionsJson = selectedActions.map(({ id, name, goal }) => ({
        id,
        name,
        goal: goal || null
      })) as Json;

      await onSubmit({
        havaya,
        actions: actionsJson,
        answers
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Create a new match record
      const { data: match, error } = await supabase
        .from('matches')
        .insert({
          player_id: user.id,
          status: 'preview',
          match_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to summary
      navigate(`/pre-match-summary/${match.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הנתונים",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      className="space-y-8 max-w-4xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="space-y-12">
        <section>
          <HavayaSelector value={havaya} onChange={setHavaya} />
        </section>

        <section>
          <ActionSelector
            position={position}
            onSubmit={handleActionsSubmit}
          />
        </section>

        <section>
          <PreMatchQuestionnaire onSubmit={setAnswers} />
        </section>

        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleSubmit}
            className="w-full max-w-md"
            size="lg"
          >
            המשך לסיכום
          </Button>
        </div>
      </div>
    </motion.div>
  );
};