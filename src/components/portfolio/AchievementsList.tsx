import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal } from "lucide-react";

export const AchievementsList = () => {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("player_achievements")
        .select("*")
        .eq("player_id", user.id)
        .order("achievement_date", { ascending: false });

      if (data) {
        setAchievements(data);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <Card key={achievement.id}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              {achievement.achievement_type === "team" ? (
                <Trophy className="h-8 w-8 text-yellow-500" />
              ) : (
                <Medal className="h-8 w-8 text-blue-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(achievement.achievement_date).toLocaleDateString("he-IL")}
                </p>
                {achievement.description && (
                  <p className="mt-2">{achievement.description}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {achievements.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          לא נמצאו הישגים
        </div>
      )}
    </div>
  );
};