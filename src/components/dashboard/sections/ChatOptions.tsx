import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Brain, MessageCircle, Activity, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense, lazy } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";

const MentalCoachingChat = lazy(() => 
  Promise.all([
    import("@/components/dashboard/MentalCoachingChat").then(module => ({ default: module.MentalCoachingChat })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

const chatOptions = [
  {
    type: 'mental',
    title: 'שיחה מנטלית',
    icon: <Brain className="h-4 w-4" />,
  },
  {
    type: 'physical',
    title: 'שיחה פיזית',
    icon: <Activity className="h-4 w-4" />,
  },
  {
    type: 'tactical',
    title: 'שיחה טקטית',
    icon: <Target className="h-4 w-4" />,
  },
];

export const ChatOptions = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
      {chatOptions.map((option, index) => (
        <Sheet key={index}>
          <SheetTrigger asChild>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-[#E0F7FA] hover:bg-[#B2EBF2] 
                transition-colors duration-200 rounded-md text-[#111827]
                shadow-sm hover:shadow focus:outline-none focus:ring-2 
                focus:ring-blue-300 focus:ring-opacity-50 w-full justify-center"
            >
              <span className="flex items-center gap-1.5">
                {option.icon}
                <MessageCircle className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium">{option.title}</span>
            </motion.button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[400px]">
            <Suspense fallback={<LoadingScreen />}>
              <MentalCoachingChat chatType={option.type} />
            </Suspense>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
};