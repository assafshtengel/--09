import { MatchDetailsForm } from "../MatchDetailsForm";
import { motion } from "framer-motion";

interface MatchDetailsStepProps {
  matchDetails: any;
  onSubmit: (details: any) => void;
}

export const MatchDetailsStep = ({ matchDetails, onSubmit }: MatchDetailsStepProps) => {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <MatchDetailsForm
        onSubmit={onSubmit}
        initialData={matchDetails}
      />
    </motion.div>
  );
};