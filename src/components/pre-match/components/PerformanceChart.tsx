import { motion } from "framer-motion";
import { Action } from "@/components/ActionSelector";

interface PerformanceChartProps {
  actions: Action[];
}

export const PerformanceChart = ({ actions }: PerformanceChartProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.slice(0, 4).map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/90 p-4 rounded-lg shadow-lg backdrop-blur-sm"
        >
          <div className="text-center">
            <span className="font-medium text-primary">{action.name}</span>
            {action.goal && (
              <span className="block mt-1 text-sm text-gray-600">יעד: {action.goal}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};