import { PreMatchSummary } from "../PreMatchSummary";
import { ShareResults } from "../../social/ShareResults";
import { motion } from "framer-motion";
import { Action } from "@/components/ActionSelector";

interface SummaryStepProps {
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
  };
  actions: Action[];
  answers: Record<string, string>;
  havaya: string;
  aiInsights: string[];
  onFinish: () => void;
}

export const SummaryStep = ({
  matchDetails,
  actions,
  answers,
  havaya,
  aiInsights,
  onFinish,
}: SummaryStepProps) => {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <ShareResults
          data={{
            title: "סיכום דוח טרום משחק",
            description: `משחק מול ${matchDetails.opponent || "יריב"}`,
            stats: {
              "מספר יעדים": actions.length,
              "רמת מוכנות": 85
            }
          }}
        />
        <h2 className="text-xl font-bold">סיכום דוח</h2>
      </div>
      <PreMatchSummary 
        matchDetails={matchDetails}
        actions={actions}
        answers={answers}
        havaya={havaya}
        aiInsights={aiInsights}
        onFinish={onFinish}
      />
    </motion.div>
  );
};