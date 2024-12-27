import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TrainingSummaryDashboard } from "@/components/training/TrainingSummaryDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-right mb-6">ברוך הבא, {profile.full_name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right">סיכום אימון</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setShowTrainingSummary(true)}
            >
              צור סיכום אימון חדש
            </Button>
          </CardContent>
        </Card>
        
        {/* Add more dashboard cards here as needed */}
      </div>
    </div>
  );
};

export default Dashboard;