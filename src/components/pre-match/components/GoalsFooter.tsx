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
      className="absolute bottom-2 left-0 right-0 bg-white/80 backdrop-blur-sm p-3 rounded-t-xl shadow-lg mx-2"
    >
      <h3 className="text-base font-semibold text-right mb-2">יעדים למשחק</h3>
      <PerformanceChart actions={actions} />
    </motion.div>
  );
};