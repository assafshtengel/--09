import { useState } from "react";
import { HavayaSelector } from "./HavayaSelector";
import { ActionSelector } from "../ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { motion } from "framer-motion";
import { Json } from "@/integrations/supabase/types";
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
  const [havaya, setHavaya] = useState("");
  const [selectedActions, setSelectedActions] = useState<Json>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    onSubmit({
      havaya,
      actions: selectedActions,
      answers,
    });
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