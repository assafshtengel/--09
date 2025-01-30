import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <LoadingSpinner size="lg" />
        <h2 className="text-2xl font-semibold text-primary">טוען את המערכת...</h2>
        <p className="text-muted-foreground">אנא המתן</p>
      </motion.div>
    </div>
  );
};