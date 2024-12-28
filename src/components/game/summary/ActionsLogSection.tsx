import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Action } from "@/components/ActionSelector";

interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

interface ActionsLogSectionProps {
  actions: Action[];
  actionLogs: ActionLog[];
}

export const ActionsLogSection = ({ actions, actionLogs }: ActionsLogSectionProps) => {
  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold text-right">פעולות</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">דקה</TableHead>
            <TableHead className="text-right">פעולה</TableHead>
            <TableHead className="text-right">תוצאה</TableHead>
            <TableHead className="text-right">הערה</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actionLogs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{log.minute}'</TableCell>
              <TableCell className="text-right">
                {actions.find(a => a.id === log.actionId)?.name}
              </TableCell>
              <TableCell>
                {log.result === "success" ? "✅" : "❌"}
              </TableCell>
              <TableCell className="text-right">{log.note || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};