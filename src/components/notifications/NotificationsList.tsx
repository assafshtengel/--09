import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  message: string;
  scheduled_for: string;
  recipient_id: string | null;
  condition: any;
  status: string;
}

interface NotificationsListProps {
  notifications: Notification[];
}

export const NotificationsList = ({ notifications = [] }: NotificationsListProps) => {
  const cancelNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
      toast.success("התזכורת בוטלה בהצלחה");
    } catch (error) {
      console.error("Error cancelling notification:", error);
      toast.error("שגיאה בביטול התזכורת");
    }
  };

  if (!notifications || notifications.length === 0) {
    return <div className="text-center py-4">אין תזכורות מתוזמנות</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>הודעה</TableHead>
          <TableHead>מועד שליחה</TableHead>
          <TableHead>נמען</TableHead>
          <TableHead>תנאים</TableHead>
          <TableHead>פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((notification) => (
          <TableRow key={notification.id}>
            <TableCell>{notification.message}</TableCell>
            <TableCell>
              {format(new Date(notification.scheduled_for), "dd/MM/yyyy HH:mm")}
            </TableCell>
            <TableCell>{notification.recipient_id || "כולם"}</TableCell>
            <TableCell>
              {notification.condition ? JSON.stringify(notification.condition) : "אין"}
            </TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => cancelNotification(notification.id)}
              >
                בטל
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};