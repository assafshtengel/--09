import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AdminDashboard = () => {
  const { data: playersCount } = useQuery({
    queryKey: ['playersCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count;
    }
  });

  const { data: recentActions } = useQuery({
    queryKey: ['recentActions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data;
    }
  });

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">דף ניהול</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>סטטיסטיקות כלליות</CardTitle>
          </CardHeader>
          <CardContent>
            <p>מספר שחקנים רשומים: {playersCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פעולות אחרונות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActions?.map((action) => (
                <div key={action.id} className="text-sm">
                  <p>{action.action} - {action.entity_type}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(action.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};