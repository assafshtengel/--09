import { useState } from "react";
import { HavayaSelector } from "./HavayaSelector";
import { ActionSelector } from "../ActionSelector";
import { PreMatchQuestionnaire } from "./PreMatchQuestionnaire";
import { Button } from "../ui/button";
import { Action } from "../ActionSelector";
import { motion } from "framer-motion";

interface PreMatchCombinedFormProps {
  position: string;
  onSubmit: (data: {
    havaya: string;
    actions: Action[];
    answers: Record<string, string>;
  }) => void;
}

export const PreMatchCombinedForm = ({ position, onSubmit }: PreMatchCombinedFormProps) => {
  const [havaya, setHavaya] = useState("");
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    onSubmit({
      havaya,
      actions: selectedActions,
      answers
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

        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={!havaya || selectedActions.length === 0 || Object.keys(answers).length === 0}
          >
            המשך לסיכום
          </Button>
        </div>
      </div>
    </motion.div>
  );
};