import { useState } from "react";
import { HavayaSelector } from "./HavayaSelector";
import { ActionSelector } from "../ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { motion } from "framer-motion";
import { Json } from "@/integrations/supabase/types";
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

export const PreMatchCombinedForm = ({ position, onSubmit }: PreMatchCombinedFormProps) => {
  const { toast } = useToast();
  const [havaya, setHavaya] = useState("");
  const [selectedActions, setSelectedActions] = useState<Json>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    // Check if actions array exists and has items
    const hasSelectedActions = Array.isArray(selectedActions) && selectedActions.length > 0 && selectedActions.some((action: any) => action.isSelected);

    if (!hasSelectedActions) {
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

    // Submit form data
    onSubmit({
      havaya,
      actions: selectedActions,
      answers
    });
  };

  const handleActionsSubmit = (actions: Json) => {
    setSelectedActions(actions);
  };

  const handleQuestionsSubmit = (questionAnswers: Record<string, string>) => {
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
            onSubmit={handleActionsSubmit}
          />
        </section>

        <section>
          <PreMatchQuestionnaire onSubmit={handleQuestionsSubmit} />
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