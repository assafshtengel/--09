import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TrainingSummaryDashboard } from "@/components/training/TrainingSummaryDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Timer, FileText, Calendar, Apple, Activity } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showTrainingSummary, setShowTrainingSummary] = useState(false);

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

  if (showTrainingSummary) {
    return <TrainingSummaryDashboard />;
  }

  const dashboardOptions = [
    {
      title: "יעדי טרום משחק",
      icon: <Trophy className="h-8 w-8 text-primary" />,
      description: "הגדר יעדים ומטרות למשחק הבא",
      onClick: () => navigate("/pre-match-report")
    },
    {
      title: "מעקב משחק",
      icon: <Timer className="h-8 w-8 text-primary" />,
      description: "עקוב אחר ביצועים במהלך המשחק",
      onClick: () => navigate("/game-selection")
    },
    {
      title: "סיכום אימון",
      icon: <FileText className="h-8 w-8 text-primary" />,
      description: "תעד ונתח את האימון שלך",
      onClick: () => setShowTrainingSummary(true)
    },
    {
      title: "מערכת שעות שבועית",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      description: "נהל את לוח הזמנים השבועי שלך",
      onClick: () => navigate("/schedule")
    },
    {
      title: "תזונה ושינה",
      icon: <Apple className="h-8 w-8 text-primary" />,
      description: "עקוב אחר התזונה ושעות השינה שלך",
      onClick: () => navigate("/daily-routine")
    },
    {
      title: "סטטיסטיקות וביצועים",
      icon: <Activity className="h-8 w-8 text-primary" />,
      description: "צפה בנתוני הביצועים והסטטיסטיקות שלך",
      onClick: () => navigate("/statistics")
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="text-right mb-8">
        <h1 className="text-3xl font-bold mb-2">ברוך הבא, {profile.full_name}</h1>
        <p className="text-muted-foreground">בחר באפשרות כדי להתחיל</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardOptions.map((option, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={option.onClick}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-right">{option.title}</CardTitle>
                {option.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-right">{option.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
