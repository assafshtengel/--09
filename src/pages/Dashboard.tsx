import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, FileText, Calendar, Activity, History, Share2, PlayCircle, Eye } from "lucide-react";
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
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-pulse text-lg font-inter">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-accent py-16 mb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">ברוך הבא, {profile?.full_name}</h1>
            <p className="text-xl opacity-90">בוא נתחיל לעבוד על השיפור שלך</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 space-y-12">
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "סיכום אימון",
              icon: <Activity className="h-6 w-6" />,
              path: "/training-summary",
              color: "bg-primary hover:bg-primary-hover"
            },
            {
              title: "תכנון משחק",
              icon: <PlayCircle className="h-6 w-6" />,
              path: "/game-selection",
              color: "bg-secondary hover:bg-secondary/90"
            },
            {
              title: "צפייה בהיסטוריה",
              icon: <Eye className="h-6 w-6" />,
              path: "/game-history",
              color: "bg-accent hover:bg-accent/90"
            }
          ].map((action, index) => (
            <Button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white h-16 text-lg font-medium rounded-xl
                transform transition-all duration-300 hover:scale-105 hover:shadow-lg
                flex items-center justify-center gap-3`}
            >
              {action.icon}
              {action.title}
            </Button>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "יעדים לפני משחק",
              icon: <Trophy />,
              description: "הגדר יעדים ומטרות למשחק הבא",
              path: "/pre-match-report",
              color: "bg-gradient-to-br from-primary to-primary-hover"
            },
            {
              title: "תכנון לפני משחק",
              icon: <Calendar />,
              description: "קבל סדר יום מותאם אישית",
              path: "/pre-game-planner",
              color: "bg-gradient-to-br from-secondary to-secondary/90"
            },
            {
              title: "מעקב משחק",
              icon: <Timer />,
              description: "עקוב אחר ביצועים במהלך המשחק",
              path: "/game-selection",
              color: "bg-gradient-to-br from-accent to-accent/90"
            },
            {
              title: "סיכום אימון",
              icon: <FileText />,
              description: "תעד ונתח את האימון שלך",
              path: "/training-summary",
              color: "bg-gradient-to-br from-highlight to-highlight/90"
            },
            {
              title: "היסטוריית משחקים",
              icon: <History />,
              description: "צפה בכל המשחקים הקודמים שלך",
              path: "/game-history",
              color: "bg-gradient-to-br from-accent to-accent/90"
            },
            {
              title: "מעקב טרום משחק",
              icon: <Activity />,
              description: "הגדר יעדים ומטרות למשחק הבא",
              path: "/pre-match-tracking",
              color: "bg-gradient-to-br from-primary to-primary-hover"
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => navigate(item.path)}
                className={`cursor-pointer ${item.color} text-white
                  transform transition-all duration-300
                  hover:shadow-xl hover:animate-card-hover
                  rounded-xl overflow-hidden`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full">
                      {item.icon}
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/90">{item.description}</p>
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
            <h2 className="text-2xl font-bold text-foreground mb-2">סטטיסטיקות וביצועים</h2>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-background rounded-lg p-6">
              <PerformanceChart />
            </div>
            <div className="bg-background rounded-lg p-6">
              <GoalsProgress />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
