import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-auth-state";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, Timer, FileText, Calendar, Activity, History, 
  Share2, PlayCircle, Eye, Brain, Dumbbell, Apple, 
  Target, Settings, Moon, MessageCircle, Clock, ClipboardList,
  BarChart2, ListTodo, Book
} from "lucide-react";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { MentalCoachingChat } from "@/components/dashboard/MentalCoachingChat";
import { MotivationalPopup } from "@/components/dashboard/MotivationalPopup";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const chatOptions = [
  {
    type: "mental",
    title: "מנטלי",
    icon: <Brain className="h-4 w-4" />,
  },
  {
    type: "nutrition",
    title: "תזונה",
    icon: <Apple className="h-4 w-4" />,
  },
  {
    type: "physical",
    title: "פיזי",
    icon: <Dumbbell className="h-4 w-4" />,
  },
  {
    type: "technical",
    title: "טכני",
    icon: <Settings className="h-4 w-4" />,
  },
  {
    type: "tactical",
    title: "טקטי",
    icon: <Target className="h-4 w-4" />,
  },
  {
    type: "sleep",
    title: "שינה",
    icon: <Moon className="h-4 w-4" />,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useAuthState();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<string | null>(null);
  const [showMotivationalPopup, setShowMotivationalPopup] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  // Single useEffect for authentication and profile loading
  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        console.log("[Dashboard] Loading profile data...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !isMounted) {
          console.log("[Dashboard] No session found");
          if (isMounted) {
            navigate("/login");
          }
          return;
        }

        setUserEmail(session.user.email);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("[Dashboard] Profile fetch error:", profileError);
          if (retryCount < 3 && isMounted) {
            setRetryCount(prev => prev + 1);
            setTimeout(loadProfileData, 1000 * (retryCount + 1));
            return;
          }
          throw profileError;
        }

        if (isMounted) {
          console.log("[Dashboard] Profile data loaded successfully");
          setProfile(profileData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[Dashboard] Error loading profile:", error);
        if (isMounted) {
          toast({
            title: "שגיאה",
            description: "לא ניתן לטעון את הפרופיל",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    };

    if (!isAuthLoading) {
      loadProfileData();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, navigate, retryCount, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8 min-h-screen bg-gradient-to-b from-background to-background/80">
      <MotivationalPopup 
        isOpen={showMotivationalPopup} 
        onClose={() => setShowMotivationalPopup(false)} 
      />
      
      {userEmail === "socr.co.il@gmail.com" && (
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
        <h2 className="text-center text-lg font-medium text-gray-700 mb-4">
          לחץ כדי לשוחח בצ'אט עם מאמן
        </h2>
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
                <MentalCoachingChat chatType={option.type} />
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
              onClick={action.onClick}
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

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <GoalsSection />
      </motion.div>

      <div className="flex justify-between items-center mb-6">
        <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent to-gray-200"></div>
        <h2 className="text-2xl font-bold px-4">סטטיסטיקות וביצועים</h2>
        <div className="h-0.5 flex-grow bg-gradient-to-l from-transparent to-gray-200"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <StatsOverview />
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PerformanceChart />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GoalsProgress />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
