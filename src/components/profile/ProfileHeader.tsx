import { motion } from "framer-motion";

interface ProfileHeaderProps {
  title: string;
}

export const ProfileHeader = ({ title }: ProfileHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border-b"
    >
      <h1 className="text-2xl font-bold text-right">{title}</h1>
    </motion.div>
  );
};