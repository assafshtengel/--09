import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsOverview } from "@/components/portfolio/StatsOverview";
import { AchievementsList } from "@/components/portfolio/AchievementsList";
import { MediaGallery } from "@/components/portfolio/MediaGallery";
import { ProfessionalReviews } from "@/components/portfolio/ProfessionalReviews";
import { Trophy, Video, FileText, Star } from "lucide-react";

const PlayerPortfolio = () => {
  const [playerData, setPlayerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setPlayerData(profile);
      } catch (error) {
        console.error("Error fetching player data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-right">
            {playerData?.full_name || "פרופיל שחקן"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-right">
            <p>קבוצה: {playerData?.club || "לא צוין"}</p>
            <p>שנתון: {playerData?.team_year || "לא צוין"}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stats" dir="rtl">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            סטטיסטיקות
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            הישגים
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            מדיה
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            חוות דעת
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <StatsOverview />
        </TabsContent>
        <TabsContent value="achievements">
          <AchievementsList />
        </TabsContent>
        <TabsContent value="media">
          <MediaGallery />
        </TabsContent>
        <TabsContent value="reviews">
          <ProfessionalReviews />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerPortfolio;