import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, MessageSquare, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [usersCount, setUsersCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const { count: users } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        setUsersCount(users || 0);

        // Fetch messages count
        const { count: messages } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true });
        
        setMessagesCount(messages || 0);

        // Fetch notifications count
        const { count: notifications } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true });
        
        setNotificationsCount(notifications || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הנתונים",
          variant: "destructive",
        });
      }
    };

    fetchStats();
  }, [toast]);

  const statsCards = [
    {
      title: "משתמשים",
      value: usersCount,
      icon: Users,
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "הודעות",
      value: messagesCount,
      icon: MessageSquare,
      onClick: () => navigate("/admin/messages"),
    },
    {
      title: "התראות",
      value: notificationsCount,
      icon: Bell,
      onClick: () => navigate("/admin/notifications"),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">לוח ניהול</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={card.onClick}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
              <card.icon className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};