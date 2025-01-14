import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const AdminDashboard = () => {
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showActionsDialog, setShowActionsDialog] = useState(false);

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

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      return data;
    }
  });

  const { data: userActions } = useQuery({
    queryKey: ['userActions', selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => {
      // First get all pre-match reports for this user
      const { data: preMatchReports } = await supabase
        .from('pre_match_reports')
        .select(`
          id,
          match_date,
          opponent,
          actions,
          questions_answers,
          matches (
            id,
            match_actions (*)
          )
        `)
        .eq('player_id', selectedUser.id)
        .order('match_date', { ascending: false });

      return preMatchReports;
    }
  });

  const handleSendEmail = async (email: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { 
          to: [email],
          subject: "הודעה מהמערכת",
          html: "<p>תוכן ההודעה כאן</p>"
        }
      });

      if (error) throw error;
      toast.success("המייל נשלח בהצלחה");
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error("שגיאה בשליחת המייל");
    }
  };

  const handleSendWhatsApp = async (phoneNumber: string) => {
    try {
      console.log('Attempting to send WhatsApp message to:', phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { 
          recipientId: selectedUser.id,
          message: "הודעה מהמערכת",
          notificationId: "manual-admin"
        }
      });

      console.log('WhatsApp send response:', { data, error });

      if (error) {
        console.error('Detailed WhatsApp error:', error);
        throw error;
      }
      
      toast.success("ההודעה נשלחה בהצלחה");
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error("שגיאה בשליחת ההודעה: " + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">דף ניהול</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer" onClick={() => setShowUsersDialog(true)}>
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

      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>רשימת משתמשים</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {users?.map((user) => (
              <Card 
                key={user.id} 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setSelectedUser(user);
                  setShowActionsDialog(true);
                }}
              >
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="font-semibold">שם מלא:</p>
                      <p>{user.full_name || 'לא צוין'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">אימייל:</p>
                      <p>{user.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold">מועדון:</p>
                      <p>{user.club || 'לא צוין'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">טלפון:</p>
                      <p>{user.phone_number || 'לא צוין'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">תפקיד:</p>
                      <p>{user.role || 'לא צוין'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">קטגוריית גיל:</p>
                      <p>{user.age_category || 'לא צוין'}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendEmail(user.email);
                      }}
                    >
                      <Mail className="h-4 w-4 ml-2" />
                      שלח מייל
                    </Button>
                    {user.phone_number && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsApp(user.phone_number);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 ml-2" />
                        שלח הודעת וואטסאפ
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showActionsDialog} onOpenChange={setShowActionsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פעולות המשתמש - {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {userActions?.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    משחק נגד {report.opponent || 'לא צוין'} - {new Date(report.match_date).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.matches?.[0]?.match_actions?.map((action: any) => (
                      <div key={action.id} className="p-2 bg-gray-50 rounded">
                        <p>פעולה: {action.action_id}</p>
                        <p>דקה: {action.minute}</p>
                        <p>תוצאה: {action.result}</p>
                        {action.note && <p>הערה: {action.note}</p>}
                      </div>
                    ))}
                    {!report.matches?.[0]?.match_actions?.length && (
                      <p className="text-gray-500">לא נמצאו פעולות במשחק זה</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!userActions?.length && (
              <p className="text-center text-gray-500">לא נמצאו משחקים למשתמש זה</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
