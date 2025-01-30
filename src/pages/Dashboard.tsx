import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Timer, FileText, Calendar, Activity, History, 
  Share2, PlayCircle, Eye, Brain, Apple, Dumbbell, 
  Target, Settings, Moon, MessageCircle, Clock, ClipboardList,
  BarChart2, ListTodo, Book, Edit, FileSpreadsheet
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load components with loading priority and minimum display time
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

const StatsOverview = lazy(() => 
  Promise.all([
    import("@/components/dashboard/StatsOverview").then(module => ({ default: module.StatsOverview })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

const MentalCoachingChat = lazy(() => 
  Promise.all([
    import("@/components/dashboard/MentalCoachingChat").then(module => ({ default: module.MentalCoachingChat })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

const MotivationalPopup = lazy(() => 
  Promise.all([
    import("@/components/dashboard/MotivationalPopup").then(module => ({ default: module.MotivationalPopup })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

const GoalsSection = lazy(() => 
  Promise.all([
    import("@/components/dashboard/GoalsSection").then(module => ({ default: module.GoalsSection })),
    new Promise(resolve => setTimeout(resolve, 500))
  ]).then(([module]) => module)
);

// Enhanced loading fallback with animation
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-8 space-y-4">
    <LoadingSpinner size="lg" />
    <p className="text-muted-foreground animate-pulse">טוען...</p>
  </div>
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

const quickActions = [
  {
    title: 'דוח טרום משחק',
    description: 'הכנה למשחק הבא',
    path: '/pre-match-report',
    icon: <FileText className="h-5 w-5" />,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'מעקב משחק',
    description: 'תיעוד ומעקב אחר משחקים',
    path: '/game-history',
    icon: <History className="h-5 w-5" />,
    gradient: 'from-green-500 to-green-600',
  },
  {
    title: 'סיכום אימון',
    description: 'סיכום והערכת אימונים',
    path: '/training-summary',
    icon: <Dumbbell className="h-5 w-5" />,
    gradient: 'from-purple-500 to-purple-600',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedChatType, setSelectedChatType] = useState<string | null>(null);
  const [showMotivationalPopup, setShowMotivationalPopup] = useState(true);
  const { toast } = useToast();

  // Optimized data fetching with React Query
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login");
        return null;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const isAdmin = profile?.email === "socr.co.il@gmail.com";

  if (isProfileLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="container mx-auto p-4 space-y-8 min-h-screen bg-gradient-to-b from-background to-background/80">
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingFallback />}>
          <MotivationalPopup 
            isOpen={showMotivationalPopup} 
            onClose={() => setShowMotivationalPopup(false)} 
          />
        </Suspense>
      
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className="bg-gradient-to-br from-purple-600 to-purple-700 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg" 
              onClick={() => navigate("/admin/dashboard")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-6 w-6 text-white" />
                  דף ניהול
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm opacity-90">גישה לניהול המערכת</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-8 border-b"
        >
          <h1 className="text-4xl font-bold mb-3">ברוך הבא, {profile?.full_name}</h1>
          <p className="text-muted-foreground text-lg">בחר באפשרות כדי להתחיל</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
          {chatOptions.map((option, index) => (
            <Sheet key={index}>
              <SheetTrigger asChild>
                <motion.button
                  onClick={() => setSelectedChatType(option.type)}
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
                <Suspense fallback={<LoadingFallback />}>
                  <MentalCoachingChat chatType={option.type} />
                </Suspense>
              </SheetContent>
            </Sheet>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-br ${action.gradient} text-white`}
                onClick={() => navigate(action.path)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {action.icon}
                    {action.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm opacity-90">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <GoalsSection />
          </motion.div>
        </Suspense>

        <div className="flex justify-between items-center mb-6">
          <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent to-gray-200"></div>
          <h2 className="text-2xl font-bold px-4">סטטיסטיקות וביצועים</h2>
          <div className="h-0.5 flex-grow bg-gradient-to-l from-transparent to-gray-200"></div>
        </div>

        <Suspense fallback={<LoadingFallback />}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <StatsOverview />
          </motion.div>
        </Suspense>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingFallback />}>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PerformanceChart />
            </motion.div>
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <GoalsProgress />
            </motion.div>
          </Suspense>
        </div>
      </AnimatePresence>
    </div>
  );
};

export { Dashboard };
