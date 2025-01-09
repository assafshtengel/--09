import { motion } from "framer-motion";

interface VerticalHavayaMenuProps {
  havaya: string[];
}

export const VerticalHavayaMenu = ({ havaya }: VerticalHavayaMenuProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute right-4 top-24 rounded-lg p-3"
    >
      <div className="space-y-2">
        {havaya.map((h, index) => (
          <motion.div
            key={h}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-primary/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg"
          >
            {h}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};