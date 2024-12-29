import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationForm } from "@/components/notifications/NotificationForm";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, BookOpen, Trash2, Plus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article';
  url: string;
}

interface NewLearningResource {
  title: string;
  description: string;
  type: 'video' | 'article';
  url: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [totalUsers, setTotalUsers] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [usageStats, setUsageStats] = useState([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [newResource, setNewResource] = useState<NewLearningResource>({
    title: '',
    description: '',
    type: 'video',
    url: ''
  });

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

      // Fetch learning resources
      const { data: resourcesData } = await supabase
        .from("learning_resources")
        .select("*")
        .order("created_at", { ascending: false });

      setResources(resourcesData || []);

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

  const handleAddResource = async () => {
    // Validate all required fields are present
    if (!newResource.title || !newResource.description || !newResource.type || !newResource.url) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("learning_resources")
        .insert(newResource)
        .select()
        .single();

      if (error) throw error;

      setResources([data, ...resources]);
      setNewResource({
        title: '',
        description: '',
        type: 'video',
        url: ''
      });
      
      toast({
        title: "המשאב נוסף בהצלחה",
        description: "המשאב החדש זמין כעת לכל המשתמשים",
      });
    } catch (error) {
      console.error("Error adding resource:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המשאב",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from("learning_resources")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setResources(resources.filter(resource => resource.id !== id));
      
      toast({
        title: "המשאב נמחק בהצלחה",
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת המשאב",
        variant: "destructive",
      });
    }
  };

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

        <Card>
          <CardHeader>
            <CardTitle>ניהול משאבי למידה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                <Input
                  placeholder="כותרת"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
                <Textarea
                  placeholder="תיאור"
                  value={newResource.description}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                />
                <Select
                  value={newResource.type}
                  onValueChange={(value: 'video' | 'article') => setNewResource({ ...newResource, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג משאב" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">סרטון</SelectItem>
                    <SelectItem value="article">מאמר</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="קישור"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                />
                <Button onClick={handleAddResource} className="w-full">
                  <Plus className="h-4 w-4 ml-2" />
                  הוסף משאב
                </Button>
              </div>

              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      {resource.type === 'video' ? (
                        <Video className="h-5 w-5 ml-2" />
                      ) : (
                        <BookOpen className="h-5 w-5 ml-2" />
                      )}
                      <div>
                        <h3 className="font-semibold">{resource.title}</h3>
                        <p className="text-sm text-gray-500">{resource.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
