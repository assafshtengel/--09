import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/LoadingScreen";

const StatsOverview = lazy(() => 
  Promise.all([
    import("@/components/dashboard/StatsOverview").then(module => ({ default: module.StatsOverview })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

const PerformanceChart = lazy(() => 
  Promise.all([
    import("@/components/dashboard/PerformanceChart").then(module => ({ default: module.PerformanceChart })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

const GoalsProgress = lazy(() => 
  Promise.all([
    import("@/components/dashboard/GoalsProgress").then(module => ({ default: module.GoalsProgress })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

export const StatsSection = () => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent to-gray-200"></div>
        <h2 className="text-2xl font-bold px-4">סטטיסטיקות וביצועים</h2>
        <div className="h-0.5 flex-grow bg-gradient-to-l from-transparent to-gray-200"></div>
      </div>

      <Suspense fallback={<LoadingScreen />}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <StatsOverview />
        </motion.div>
      </Suspense>
    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingScreen />}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PerformanceChart />
          </motion.div>
        </Suspense>
        <Suspense fallback={<LoadingScreen />}>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GoalsProgress />
          </motion.div>
        </Suspense>
      </div>
    </>
  );
};