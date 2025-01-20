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
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-sm border border-primary/20"
    >
      <h3 className="text-xl font-semibold text-center mb-4 text-primary">ההוויות שבחרת למשחק</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nonEmptyHavayot.map(([category, value]) => (
          <motion.div
            key={category}
            whileHover={{ scale: 1.02 }}
            className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-primary/10"
          >
            <div className="flex items-center justify-end">
              <span className="text-lg font-medium px-4 py-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors w-full text-center">
                {value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};