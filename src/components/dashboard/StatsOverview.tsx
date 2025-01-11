import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export const StatsOverview = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("player_stats")
          .select("*")
          .eq("player_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching stats:", error);
          toast({
            variant: "destructive",
            title: "שגיאה בטעינת נתונים",
            description: "לא ניתן לטעון את הנתונים כרגע, אנא נסה שוב מאוחר יותר"
          });
          return;
        }

        setStats(data);
      } catch (error) {
        console.error("Error in fetchStats:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת נתונים",
          description: "אירעה שגיאה בלתי צפויה, אנא נסה שוב מאוחר יותר"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const chartData = stats ? [
    { name: "דקות משחק", value: stats.minutes_played },
    { name: "שערים", value: stats.goals },
    { name: "בישולים", value: stats.assists },
    { name: "בעיטות למסגרת", value: stats.shots_on_target },
    { name: "פעולות הגנתיות", value: stats.defensive_actions },
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6 text-center">
        <CardTitle className="mb-4">אין נתונים זמינים</CardTitle>
        <p className="text-muted-foreground">
          לא נמצאו נתונים סטטיסטיים. הנתונים יתעדכנו לאחר המשחק הראשון.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden bg-gradient-to-br from-background to-background/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">סטטיסטיקות עונה נוכחית</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <motion.div 
                className="text-center p-4 rounded-lg bg-primary/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-primary">{stats?.minutes_played || 0}</div>
                <div className="text-sm text-muted-foreground">דקות משחק</div>
              </motion.div>
              <motion.div 
                className="text-center p-4 rounded-lg bg-secondary/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-secondary">{stats?.goals || 0}</div>
                <div className="text-sm text-muted-foreground">שערים</div>
              </motion.div>
              <motion.div 
                className="text-center p-4 rounded-lg bg-accent/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-accent">{stats?.assists || 0}</div>
                <div className="text-sm text-muted-foreground">בישולים</div>
              </motion.div>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'currentColor' }}
                    fontSize={12}
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor' }}
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="currentColor"
                    className="fill-primary"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden bg-gradient-to-br from-background to-background/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">נתונים פיזיולוגיים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <motion.div 
                className="text-center p-4 rounded-lg bg-primary/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-primary">{stats?.speed_record || "-"}</div>
                <div className="text-sm text-muted-foreground">מהירות (קמ"ש)</div>
              </motion.div>
              <motion.div 
                className="text-center p-4 rounded-lg bg-secondary/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-secondary">{stats?.jump_height || "-"}</div>
                <div className="text-sm text-muted-foreground">גובה קפיצה (ס"מ)</div>
              </motion.div>
              <motion.div 
                className="text-center p-4 rounded-lg bg-accent/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl font-bold text-accent">{stats?.endurance_score || "-"}</div>
                <div className="text-sm text-muted-foreground">ציון סיבולת</div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};