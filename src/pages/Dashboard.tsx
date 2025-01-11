import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-right">לוח בקרה</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-right">ברוך הבא {profile?.full_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-right">
                <p>קבוצה: {profile?.club || "לא צוין"}</p>
                <p>תפקיד: {profile?.roles?.join(", ") || "לא צוין"}</p>
                <p>שנתון: {profile?.team_year || "לא צוין"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/portfolio")}
                  className="p-4 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors text-right"
                >
                  תיק שחקן
                </button>
                <button
                  onClick={() => navigate("/pre-game-planner")}
                  className="p-4 bg-green-50 rounded-lg text-green-600 hover:bg-green-100 transition-colors text-right"
                >
                  תכנון משחק
                </button>
                <button
                  onClick={() => navigate("/mental-learning")}
                  className="p-4 bg-purple-50 rounded-lg text-purple-600 hover:bg-purple-100 transition-colors text-right"
                >
                  אימון מנטלי
                </button>
                <button
                  onClick={() => navigate("/game-history")}
                  className="p-4 bg-orange-50 rounded-lg text-orange-600 hover:bg-orange-100 transition-colors text-right"
                >
                  היסטוריית משחקים
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-right">התראות אחרונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-right text-gray-500">
              אין התראות חדשות
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;