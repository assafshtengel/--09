import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface Notification {
  id: string;
  message: string;
  scheduled_for: string;
  recipient_id: string | null;
  created_at: string;
}

interface NotificationHistoryProps {
  notifications: Notification[];
}

export const NotificationHistory = ({ notifications }: NotificationHistoryProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>הודעה</TableHead>
          <TableHead>נשלח ב</TableHead>
          <TableHead>נמען</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((notification) => (
          <TableRow key={notification.id}>
            <TableCell>{notification.message}</TableCell>
            <TableCell>
              {format(new Date(notification.created_at), "dd/MM/yyyy HH:mm")}
            </TableCell>
            <TableCell>{notification.recipient_id || "כולם"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};