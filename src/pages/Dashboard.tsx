import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, FileText, Calendar, Activity } from "lucide-react";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { GoalsProgress } from "@/components/dashboard/GoalsProgress";
import { StatsOverview } from "@/components/dashboard/StatsOverview";

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
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  if (!profile) {
    return null;
  }

  const quickActions = [
    {
      title: "יעדי טרום משחק",
      icon: <Trophy className="h-6 w-6 text-primary" />,
      description: "הגדר יעדים ומטרות למשחק הבא",
      onClick: () => navigate("/pre-match-report"),
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "מעקב משחק",
      icon: <Timer className="h-6 w-6 text-primary" />,
      description: "עקוב אחר ביצועים במהלך המשחק",
      onClick: () => navigate("/player"),
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "סיכום אימון",
      icon: <FileText className="h-6 w-6 text-primary" />,
      description: "תעד ונתח את האימון שלך",
      onClick: () => navigate("/training-summary"),
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "מערכת שעות",
      icon: <Calendar className="h-6 w-6 text-primary" />,
      description: "נהל את לוח הזמנים השבועי שלך",
      onClick: () => navigate("/schedule"),
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Header Section */}
      <div className="text-right mb-8">
        <h1 className="text-4xl font-bold mb-2">ברוך הבא, {profile.full_name}</h1>
        <p className="text-muted-foreground text-lg">בחר באפשרות כדי להתחיל</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`p-6 rounded-xl bg-gradient-to-r ${action.gradient} transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-white`}
          >
            <div className="flex flex-col items-end space-y-4">
              <div className="bg-white/20 p-3 rounded-full">
                {action.icon}
              </div>
              <h3 className="text-xl font-bold">{action.title}</h3>
              <p className="text-sm opacity-90 text-right">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Statistics Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-0.5 flex-grow bg-gradient-to-r from-transparent to-gray-200"></div>
          <h2 className="text-2xl font-bold px-4">סטטיסטיקות וביצועים</h2>
          <div className="h-0.5 flex-grow bg-gradient-to-l from-transparent to-gray-200"></div>
        </div>

        <StatsOverview />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PerformanceChart />
          <GoalsProgress />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;