import { motion } from "framer-motion";

interface WelcomeSectionProps {
  fullName?: string;
}

export const WelcomeSection = ({ fullName }: WelcomeSectionProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center py-8 border-b"
    >
      <h1 className="text-4xl font-bold mb-3">ברוך הבא, {fullName}</h1>
      <p className="text-muted-foreground text-lg">בחר באפשרות כדי להתחיל</p>
    </motion.div>
  );
};