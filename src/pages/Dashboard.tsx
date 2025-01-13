import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, FileText, Calendar, Activity, History, Share2, PlayCircle, Eye, Brain, Dumbbell, Apple, Heart, Smile, MessageCircle } from "lucide-react";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { MentalCoachingChat } from "@/components/dashboard/MentalCoachingChat";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Shield } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedChatType, setSelectedChatType] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profileData) {
          navigate("/player");
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("admin_credentials")
        .select("*")
        .eq("email", session.user.email)
        .single();

      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, []);

  const chatOptions = [
    {
      title: "אימון מנטאלי",
      icon: <Brain className="h-4 w-4" />,
      type: "mental",
      gradient: "from-blue-600 to-blue-700"
    },
    {
      title: "תזונה",
      icon: <Apple className="h-4 w-4" />,
      type: "nutrition",
      gradient: "from-green-600 to-green-700"
    },
    {
      title: "אימוני כוח",
      icon: <Dumbbell className="h-4 w-4" />,
      type: "strength",
      gradient: "from-purple-600 to-purple-700"
    },
    {
      title: "בריאות",
      icon: <Heart className="h-4 w-4" />,
      type: "health",
      gradient: "from-red-600 to-red-700"
    },
    {
      title: "כושר",
      icon: <Activity className="h-4 w-4" />,
      type: "fitness",
      gradient: "from-orange-600 to-orange-700"
    },
    {
      title: "מוטיבציה",
      icon: <Smile className="h-4 w-4" />,
      type: "motivation",
      gradient: "from-yellow-600 to-yellow-700"
    }
  ];

  const quickActions = [
    {
      title: "יעדי טרום משחק",
      icon: <Trophy className="h-6 w-6 text-white" />,
      description: "הגדר יעדים ומטרות למשחק הבא",
      onClick: () => navigate("/pre-match-report"),
      gradient: "from-blue-600 to-blue-700"
    },
    {
      title: "תכנון לפני משחק",
      icon: <Calendar className="h-6 w-6 text-white" />,
      description: "קבל סדר יום מותאם אישית ל-24 שעות לפני המשחק",
      onClick: () => navigate("/pre-game-planner"),
      gradient: "from-purple-600 to-purple-700"
    },
    {
      title: "מעקב משחק",
      icon: <Timer className="h-6 w-6 text-white" />,
      description: "עקוב אחר ביצועים במהלך המשחק",
      onClick: () => navigate("/game-selection"),
      gradient: "from-emerald-600 to-emerald-700"
    },
    {
      title: "סיכום אימון",
      icon: <FileText className="h-6 w-6 text-white" />,
      description: "תעד ונתח את האימון שלך",
      onClick: () => navigate("/training-summary"),
      gradient: "from-amber-600 to-amber-700"
    },
    {
      title: "מערכת שעות",
      icon: <Calendar className="h-6 w-6 text-white" />,
      description: "נהל את לוח הזמנים השבועי שלך",
      onClick: () => navigate("/schedule"),
      gradient: "from-rose-600 to-rose-700"
    },
    {
      title: "היסטוריית משחקים",
      icon: <History className="h-6 w-6 text-white" />,
      description: "צפה בכל המשחקים הקודמים שלך",
      onClick: () => navigate("/game-history"),
      gradient: "from-indigo-600 to-indigo-700"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">טוען...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8 min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Add Admin Link if user is admin */}
      {isAdmin && (
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg" onClick={() => navigate("/admin/auth")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-6 w-6 text-white" />
              דף ניהול
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90">גישה לניהול המערכת</p>
          </CardContent>
        </Card>
      )}
      
      {/* Chat Options Section */}
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

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 border-b"
      >
        <h1 className="text-4xl font-bold mb-3">ברוך הבא, {profile?.full_name}</h1>
        <p className="text-muted-foreground text-lg">בחר באפשרות כדי להתחיל</p>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {quickActions.map((action, index) => (
          <Card 
            key={index}
            className={`bg-gradient-to-br ${action.gradient} text-white cursor-pointer 
              transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
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
        ))}
      </motion.div>

      {/* Statistics Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-8"
      >
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
      </motion.div>

      {/* Call to Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap justify-center gap-4 pt-8"
      >
        <Button 
          onClick={() => navigate("/game-selection")}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full flex items-center gap-2"
        >
          <PlayCircle className="h-5 w-5" />
          שחק משחק נוסף
        </Button>
        <Button 
          onClick={() => navigate("/game-history")}
          className="bg-secondary hover:bg-secondary/90 text-white px-6 py-2 rounded-full flex items-center gap-2"
        >
          <Eye className="h-5 w-5" />
          צפה במשחקים קודמים
        </Button>
        <Button 
          onClick={() => navigate("/player")}
          className="bg-accent hover:bg-accent/90 text-white px-6 py-2 rounded-full flex items-center gap-2"
        >
          <Share2 className="h-5 w-5" />
          שתף את ההישגים שלך
        </Button>
      </motion.div>
    </div>
  );
};

export default Dashboard;
