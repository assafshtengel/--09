import { useEffect, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Trophy, Timer, FileText, Calendar, Activity, History, 
  Share2, PlayCircle, Eye, Brain, Apple, Dumbbell, 
  Target, Settings, Moon, MessageCircle, Clock, ClipboardList,
  BarChart2, ListTodo, Book, Edit, FileSpreadsheet
} from "lucide-react";

// Lazy load components
const PerformanceChart = lazy(() => import("@/components/dashboard/PerformanceChart").then(module => ({ default: module.PerformanceChart })));
const GoalsProgress = lazy(() => import("@/components/dashboard/GoalsProgress").then(module => ({ default: module.GoalsProgress })));
const StatsOverview = lazy(() => import("@/components/dashboard/StatsOverview").then(module => ({ default: module.StatsOverview })));
const MentalCoachingChat = lazy(() => import("@/components/dashboard/MentalCoachingChat").then(module => ({ default: module.MentalCoachingChat })));
const MotivationalPopup = lazy(() => import("@/components/dashboard/MotivationalPopup").then(module => ({ default: module.MotivationalPopup })));
const GoalsSection = lazy(() => import("@/components/dashboard/GoalsSection").then(module => ({ default: module.GoalsSection })));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const isAdmin = profile?.email === "socr.co.il@gmail.com";

  if (isProfileLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="container mx-auto p-4 space-y-8 min-h-screen bg-gradient-to-b from-background to-background/80">
      <Suspense fallback={<LoadingFallback />}>
        <MotivationalPopup 
          isOpen={showMotivationalPopup} 
          onClose={() => setShowMotivationalPopup(false)} 
        />
      </Suspense>
      
      {isAdmin && (
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
      )}

      <div className="bg-[#F7FBFF] rounded-lg p-6 shadow-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center"
        >
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
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center py-8 border-b"
      >
        <h1 className="text-4xl font-bold mb-3">ברוך הבא, {profile?.full_name}</h1>
        <p className="text-muted-foreground text-lg">בחר באפשרות כדי להתחיל</p>
      </motion.div>

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
    </div>
  );
};

export default Dashboard;
