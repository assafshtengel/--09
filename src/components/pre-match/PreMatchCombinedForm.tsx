import { useState } from "react";
import { HavayaSelector } from "./HavayaSelector";
import { ActionSelector } from "../ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { motion } from "framer-motion";
import { Json } from "@/integrations/supabase/types";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";

interface PreMatchCombinedFormProps {
  position: string;
  onSubmit: (data: {
    havaya: string;
    actions: Json;
    answers: Record<string, string>;
  }) => void;
}

export const PreMatchCombinedForm = ({ position, onSubmit }: PreMatchCombinedFormProps) => {
  const { toast } = useToast();
  const [havaya, setHavaya] = useState("");
  const [selectedActions, setSelectedActions] = useState<Json>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    try {
      console.log("Submitting form with data:", {
        havaya,
        actions: selectedActions,
        answers,
      });
      
      onSubmit({
        havaya,
        actions: selectedActions,
        answers,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הנתונים",
        variant: "destructive",
      });
    }
  };

  const handleQuestionnaireSubmit = (questionAnswers: Record<string, string>) => {
    console.log("Received answers from questionnaire:", questionAnswers);
    setAnswers(questionAnswers);
  };

  const handleHavayaChange = (value: string) => {
    console.log("Selected havaya:", value);
    setHavaya(value);
  };

  const handleActionsSubmit = (actions: Json) => {
    console.log("Selected actions:", actions);
    setSelectedActions(actions);
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <section>
        <HavayaSelector value={havaya} onChange={handleHavayaChange} />
      </section>

      <section>
        <ActionSelector
          position={position}
          onSubmit={handleActionsSubmit}
        />
      </section>

      <section>
        <PreMatchQuestionnaire onSubmit={handleQuestionnaireSubmit} />
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
    </motion.div>
  );
};