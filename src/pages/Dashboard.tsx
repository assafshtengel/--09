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

  const quickActions = [
    {
      title: "יעדי טרום משחק",
      icon: <Trophy className="h-6 w-6 text-white" />,
      description: "הגדר יעדים ומטרות למשחק הבא",
      onClick: () => navigate("/pre-match-report"),
      gradient: "from-[#D6BCFA] to-[#B794F4]" // Softer purple
    },
    {
      title: "תכנון לפני משחק",
      icon: <Calendar className="h-6 w-6 text-white" />,
      description: "קבל סדר יום מותאם אישית ל-24 שעות לפני המשחק",
      onClick: () => navigate("/pre-game-planner"),
      gradient: "from-[#FEC6A1] to-[#FDB797]" // Soft orange
    },
    {
      title: "מעקב משחק",
      icon: <Timer className="h-6 w-6 text-white" />,
      description: "עקוב אחר ביצועים במהלך המשחק",
      onClick: () => navigate("/game-selection"),
      gradient: "from-[#C6F6D5] to-[#9AE6B4]" // Soft green
    },
    {
      title: "סיכום אימון",
      icon: <FileText className="h-6 w-6 text-white" />,
      description: "תעד ונתח את האימון שלך",
      onClick: () => navigate("/training-summary"),
      gradient: "from-[#FED7D7] to-[#FEB2B2]" // Soft red
    },
    {
      title: "מערכת שעות",
      icon: <Calendar className="h-6 w-6 text-white" />,
      description: "נהל את לוח הזמנים השבועי שלך",
      onClick: () => navigate("/schedule"),
      gradient: "from-[#E9D8FD] to-[#D6BCFA]" // Light purple
    },
    {
      title: "היסטוריית משחקים",
      icon: <History className="h-6 w-6 text-white" />,
      description: "צפה בכל המשחקים הקודמים שלך",
      onClick: () => navigate("/game-history"),
      gradient: "from-[#BEE3F8] to-[#90CDF4]" // Soft blue
    }
  ];

  const additionalActions = [
    {
      title: "מעקב טרום משחק",
      icon: <Activity className="h-5 w-5" />,
      onClick: () => navigate("/pre-match-tracking"),
      color: "bg-[#D6BCFA] hover:bg-[#B794F4]"
    },
    {
      title: "מעקב משחק",
      icon: <Timer className="h-5 w-5" />,
      onClick: () => navigate("/game-tracking"),
      color: "bg-[#FEC6A1] hover:bg-[#FDB797]"
    },
    {
      title: "סיכום אימון",
      icon: <FileText className="h-5 w-5" />,
      onClick: () => navigate("/training-summary"),
      color: "bg-[#C6F6D5] hover:bg-[#9AE6B4]"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">טוען...</div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto p-4 space-y-8 min-h-screen bg-gray-50">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 border-b"
      >
        <h1 className="text-4xl font-bold mb-4">ברוך הבא, {profile?.full_name}</h1>
      </motion.div>

      {/* Mental Coaching Chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <MentalCoachingChat />
      </motion.div>

      {/* Additional Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-6 mb-12"
      >
        {additionalActions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white px-8 py-3 rounded-xl flex items-center gap-3 
              shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px] justify-center
              text-lg font-medium transform hover:scale-105`}
          >
            {action.icon}
            {action.title}
          </Button>
        ))}
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
      >
        {quickActions.map((action, index) => (
          <motion.button
            key={index}
            variants={item}
            onClick={action.onClick}
            className={`p-8 rounded-2xl bg-gradient-to-r ${action.gradient} 
              transform hover:scale-105 transition-all duration-300 
              shadow-lg hover:shadow-xl text-white min-h-[220px]
              flex flex-col items-end space-y-6`}
          >
            <div className="bg-white/20 p-4 rounded-full">
              {action.icon}
            </div>
            <h3 className="text-2xl font-bold">{action.title}</h3>
            <p className="text-base opacity-90 text-right">{action.description}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* Statistics Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-12 bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent to-gray-200"></div>
          <h2 className="text-3xl font-bold px-6">סטטיסטיקות וביצועים</h2>
          <div className="h-0.5 flex-grow bg-gradient-to-l from-transparent to-gray-200"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 p-6 rounded-xl"
        >
          <StatsOverview />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 p-6 rounded-xl"
          >
            <PerformanceChart />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 p-6 rounded-xl"
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
        className="flex flex-wrap justify-center gap-6 py-12"
      >
        <Button 
          onClick={() => navigate("/game-selection")}
          className="bg-[#D6BCFA] hover:bg-[#B794F4] text-white px-8 py-3 rounded-xl flex items-center gap-3 
            shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg font-medium"
        >
          <PlayCircle className="h-5 w-5" />
          שחק משחק נוסף
        </Button>
        <Button 
          onClick={() => navigate("/game-history")}
          className="bg-[#FEC6A1] hover:bg-[#FDB797] text-white px-8 py-3 rounded-xl flex items-center gap-3 
            shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg font-medium"
        >
          <Eye className="h-5 w-5" />
          צפה במשחקים קודמים
        </Button>
        <Button 
          onClick={() => navigate("/player")}
          className="bg-[#C6F6D5] hover:bg-[#9AE6B4] text-white px-8 py-3 rounded-xl flex items-center gap-3 
            shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg font-medium"
        >
          <Share2 className="h-5 w-5" />
          שתף את ההישגים שלך
        </Button>
      </motion.div>
    </div>
  );
};

export default Dashboard;