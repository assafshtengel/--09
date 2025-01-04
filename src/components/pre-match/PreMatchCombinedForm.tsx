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
      
      // Validate that we have answers
      if (Object.keys(answers).length === 0) {
        console.warn("No answers provided before submission");
      }

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
            onSubmit={setSelectedActions}
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
      </div>
    </motion.div>
  );
};