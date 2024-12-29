import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationForm } from "@/components/notifications/NotificationForm";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { NotificationHistory } from "@/components/notifications/NotificationHistory";

const NotificationsManager = () => {
  const [activeTab, setActiveTab] = useState("create");

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center">טוען...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-right">ניהול תזכורות והודעות</h1>
      
      <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="create">יצירת תזכורת</TabsTrigger>
          <TabsTrigger value="scheduled">תזכורות מתוזמנות</TabsTrigger>
          <TabsTrigger value="history">היסטוריה</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>יצירת תזכורת חדשה</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>תזכורות מתוזמנות</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationsList notifications={notifications?.filter(n => n.status === 'pending') || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>היסטוריית הודעות</CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationHistory notifications={notifications?.filter(n => n.status === 'sent') || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsManager;