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
      className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 shadow-lg"
    >
      <h3 className="text-2xl font-bold text-center mb-6 text-primary">
        ההוויות שבחרת למשחק
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nonEmptyHavayot.map(([category, value]) => (
          <motion.div
            key={category}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-md border-2 border-primary/20 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center justify-center">
                <span className="text-xl font-semibold px-6 py-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 text-primary w-full text-center">
                  {value}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};