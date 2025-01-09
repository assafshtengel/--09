import { motion } from "framer-motion";
import { PerformanceChart } from "./PerformanceChart";

interface GoalsFooterProps {
  actions: any[];
}

export const GoalsFooter = ({ actions }: GoalsFooterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 rounded-t-xl shadow-lg"
    >
      <h3 className="text-lg font-semibold text-right mb-3">יעדים למשחק</h3>
      <PerformanceChart actions={actions} />
    </motion.div>
  );
};