import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { PlayerLevel } from "@/components/achievements/PlayerLevel";

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  isCompleted: boolean;
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [playerStats, setPlayerStats] = useState({
    level: 1,
    points: 0,
    pointsToNextLevel: 100,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch player achievements
        const { data: achievementsData, error } = await supabase
          .from("player_achievements")
          .select("*")
          .eq("player_id", user.id);

        if (error) throw error;

        // Transform the data
        const transformedAchievements = achievementsData.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description || "",
          points: 50, // Default points value
          progress: achievement.progress || 0,
          isCompleted: achievement.is_completed || false,
        }));

        setAchievements(transformedAchievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        toast({
          title: "שגיאה בטעינת הישגים",
          description: "אנא נסה שנית מאוחר יותר",
          variant: "destructive",
        });
      }
    };

    fetchAchievements();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-right">הישגים ותגמולים</h1>
      
      <div className="mb-8">
        <PlayerLevel {...playerStats} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            {...achievement}
          />
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          עדיין אין הישגים. התחל לשחק כדי לצבור הישגים!
        </div>
      )}
    </div>
  );
};

export default Achievements;