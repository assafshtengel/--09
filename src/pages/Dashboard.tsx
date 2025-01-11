import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, FileText, Calendar, Activity, History, PlayCircle, Eye } from "lucide-react";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { MentalCoachingChat } from "@/components/dashboard/MentalCoachingChat";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F5F7FA]">
        <div className="animate-pulse text-lg font-inter">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-inter">
      {/* Hero Section with Enhanced Gradient Background */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-secondary py-16 mb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">ברוך הבא, {profile?.full_name}</h1>
            <p className="text-xl opacity-90 mb-8">בוא נתחיל לעבוד על השיפור שלך</p>
            <Button 
              onClick={() => navigate("/game-selection")}
              className="bg-white text-primary hover:bg-opacity-90 text-lg px-8 py-3 rounded-xl
                transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              התחל עכשיו
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-12">
        {/* Mental Coaching Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <MentalCoachingChat />
        </motion.div>

        {/* Section Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">תכנים מרכזיים</h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "יעדים לפני משחק",
              icon: <Trophy className="h-5 w-5" />,
              description: "הגדר יעדים ומטרות למשחק הבא",
              path: "/pre-match-report",
              color: "bg-[#D1FAE5] hover:bg-[#A7F3D0]"
            },
            {
              title: "תכנון לפני משחק",
              icon: <Calendar className="h-5 w-5" />,
              description: "קבל סדר יום מותאם אישית",
              path: "/pre-game-planner",
              color: "bg-[#DBEAFE] hover:bg-[#BFDBFE]"
            },
            {
              title: "מעקב משחק",
              icon: <Timer className="h-5 w-5" />,
              description: "עקוב אחר ביצועים במהלך המשחק",
              path: "/game-selection",
              color: "bg-[#FEE2E2] hover:bg-[#FECACA]"
            },
            {
              title: "סיכום אימון",
              icon: <FileText className="h-5 w-5" />,
              description: "תעד ונתח את האימון שלך",
              path: "/training-summary",
              color: "bg-[#EDE9FE] hover:bg-[#DDD6FE]"
            },
            {
              title: "היסטוריית משחקים",
              icon: <History className="h-5 w-5" />,
              description: "צפה בכל המשחקים הקודמים שלך",
              path: "/game-history",
              color: "bg-[#D1FAE5] hover:bg-[#A7F3D0]"
            },
            {
              title: "תכנון וניהול לוח זמנים שבועי",
              icon: <Activity className="h-5 w-5" />,
              description: "תכנון וניהול לוח זמנים שבועי",
              path: "/weekly-planner",
              color: "bg-[#DBEAFE] hover:bg-[#BFDBFE]"
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card
                onClick={() => navigate(item.path)}
                className={`cursor-pointer ${item.color} border border-white/20
                  transform transition-all duration-300
                  hover:shadow-xl rounded-xl overflow-hidden`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full">
                      {item.icon}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 space-y-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">סטטיסטיקות וביצועים</h2>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#F5F7FA] rounded-lg p-6">
              <PerformanceChart />
            </div>
            <div className="bg-[#F5F7FA] rounded-lg p-6">
              <GoalsProgress />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
