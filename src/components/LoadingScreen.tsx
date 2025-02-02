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
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <LoadingSpinner />
        </motion.div>
        <motion.h2 
          className="text-2xl font-semibold text-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          טוען את המערכת...
        </motion.h2>
        <p className="text-muted-foreground">אנא המתן</p>
      </motion.div>
    </div>
  );
};