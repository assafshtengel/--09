import { motion } from "framer-motion";

interface HavayotDisplayProps {
  havayot: Record<string, string>;
}

export const HavayotDisplay = ({ havayot }: HavayotDisplayProps) => {
  const nonEmptyHavayot = Object.entries(havayot).filter(([_, value]) => value.trim().length > 0);

  if (nonEmptyHavayot.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-blue-100"
    >
      <h3 className="text-lg font-semibold text-center mb-4">ההוויות שבחרת למשחק</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nonEmptyHavayot.map(([category, value]) => (
          <div
            key={category}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-end space-x-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};