import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error("Error in fetchProfile:", error);
    }
  };

  const navigationItems = [
    { title: "תכנון משחק", path: "/pre-game-planner", color: "bg-primary/10" },
    { title: "מעקב משחק", path: "/match/new", color: "bg-secondary/10" },
    { title: "סיכום אימון", path: "/training-summary", color: "bg-accent/10" },
    { title: "היסטוריית משחקים", path: "/game-history", color: "bg-primary/10" },
    { title: "אימון מנטלי", path: "/mental-learning", color: "bg-secondary/10" },
    { title: "התראות", path: "/notifications", color: "bg-accent/10" },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-background to-background/95">
          <CardHeader>
            <CardTitle className="text-2xl">ברוך הבא {profile?.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    variant="ghost"
                    className={`w-full h-24 ${item.color} hover:bg-opacity-80 transition-all`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.title}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <StatsOverview />
        <PerformanceChart />
      </div>
    </div>
  );
};

export default Dashboard;