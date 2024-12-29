import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationForm } from "@/components/notifications/NotificationForm";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [totalUsers, setTotalUsers] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [usageStats, setUsageStats] = useState([]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        toast({
          title: "גישה נדחתה",
          description: "אין לך הרשאות לצפות בדף זה",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    };

    checkAdminStatus();
  }, [navigate, toast]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      // Fetch total users
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact" });

      setTotalUsers(count || 0);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      setNotifications(notificationsData || []);

      // Fetch usage statistics (matches as an example)
      const { data: matchesData } = await supabase
        .from("matches")
        .select("created_at")
        .order("created_at", { ascending: true });

      // Process matches data for the chart
      const stats = (matchesData || []).reduce((acc, match) => {
        const date = new Date(match.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(stats).map(([date, count]) => ({
        date,
        matches: count,
      }));

      setUsageStats(chartData);
    };

    fetchData();
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">דף ניהול</h1>
      
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>סטטיסטיקות משתמשים</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{totalUsers}</p>
              <p className="text-muted-foreground">סה״כ משתמשים</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>פעילות לאורך זמן</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={usageStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="matches" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ניהול הודעות</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">יצירת הודעה</TabsTrigger>
                <TabsTrigger value="scheduled">הודעות מתוזמנות</TabsTrigger>
                <TabsTrigger value="history">היסטוריה</TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <NotificationForm />
              </TabsContent>

              <TabsContent value="scheduled">
                <NotificationsList 
                  notifications={notifications.filter(n => n.status === 'pending')} 
                />
              </TabsContent>

              <TabsContent value="history">
                <NotificationHistory 
                  notifications={notifications.filter(n => n.status === 'sent')} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;