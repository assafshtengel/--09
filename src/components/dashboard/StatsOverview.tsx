import { useEffect } from "react";
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
import { LoadingScreen } from "@/components/LoadingScreen";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const fetchPlayerStats = async () => {
  console.log("Fetching player stats...");
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Error fetching user:", userError);
    throw userError;
  }
  
  if (!user) {
    console.log("No user found");
    return null;
  }
  
  console.log("Fetching stats for user:", user.id);
  const { data, error } = await supabase
    .from("player_stats")
    .select("*")
    .eq("player_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }

  console.log("Stats fetched successfully:", data);
  return data || {
    minutes_played: 0,
    goals: 0,
    assists: 0,
    shots_on_target: 0,
    defensive_actions: 0,
    speed_record: 0,
    jump_height: 0,
    endurance_score: 0
  };
};

const StatCard = ({ value, label, className }: { value: number | string, label: string, className: string }) => (
  <motion.div 
    className={`text-center p-4 rounded-lg ${className}`}
    whileHover={{ scale: 1.05 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </motion.div>
);

const LoadingCard = () => (
  <div className="space-y-3">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export const StatsOverview = () => {
  const { toast } = useToast();
  
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['playerStats'],
    queryFn: fetchPlayerStats,
    retry: 2,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  useEffect(() => {
    if (error) {
      console.error("Error in StatsOverview:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הנתונים",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden bg-gradient-to-br from-background to-background/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">סטטיסטיקות עונה נוכחית</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <LoadingCard key={i} />
              ))}
            </div>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = stats ? [
    { name: "דקות משחק", value: stats.minutes_played },
    { name: "שערים", value: stats.goals },
    { name: "בישולים", value: stats.assists },
    { name: "בעיטות למסגרת", value: stats.shots_on_target },
    { name: "פעולות הגנתיות", value: stats.defensive_actions },
  ] : [];

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
              <StatCard 
                value={stats?.minutes_played || 0}
                label="דקות משחק"
                className="bg-primary/10"
              />
              <StatCard 
                value={stats?.goals || 0}
                label="שערים"
                className="bg-secondary/10"
              />
              <StatCard 
                value={stats?.assists || 0}
                label="בישולים"
                className="bg-accent/10"
              />
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
              <StatCard 
                value={stats?.speed_record || "-"}
                label='מהירות (קמ"ש)'
                className="bg-primary/10"
              />
              <StatCard 
                value={stats?.jump_height || "-"}
                label='גובה קפיצה (ס"מ)'
                className="bg-secondary/10"
              />
              <StatCard 
                value={stats?.endurance_score || "-"}
                label="ציון סיבולת"
                className="bg-accent/10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};