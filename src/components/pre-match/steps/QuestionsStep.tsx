import { PreMatchQuestionnaire } from "../PreMatchQuestionnaire";
import { motion } from "framer-motion";

interface QuestionsStepProps {
  onSubmit: (answers: Record<string, string>) => void;
}

export const QuestionsStep = ({ onSubmit }: QuestionsStepProps) => {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <PreMatchQuestionnaire onSubmit={onSubmit} />
    </motion.div>
  );
};