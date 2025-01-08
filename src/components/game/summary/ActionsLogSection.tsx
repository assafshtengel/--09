import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Action } from "@/components/ActionSelector";

interface ActionsLogSectionProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
    minute: number;
    note?: string;
  }>;
}

export const ActionsLogSection = ({ actions, actionLogs }: ActionsLogSectionProps) => {
  // Sort logs by minute
  const sortedLogs = [...actionLogs].sort((a, b) => a.minute - b.minute);

  const formatMinute = (minute: number) => {
    if (minute >= 45) {
      const secondHalfMinute = minute - 45;
      return `${secondHalfMinute} (2)`;
    }
    return `${minute} (1)`;
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg md:text-xl font-semibold text-right">פעולות במשחק</h3>
      <ScrollArea className="h-[300px] w-full rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="text-right">דקה</TableCell>
              <TableCell className="text-right">פעולה</TableCell>
              <TableCell className="text-right">תוצאה</TableCell>
              <TableCell className="text-right">הערות</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell className="px-2 md:px-4">{formatMinute(log.minute)}'</TableCell>
                <TableCell className="text-right px-2 md:px-4 text-sm md:text-base">
                  {actions.find(action => action.id === log.actionId)?.name || log.actionId}
                </TableCell>
                <TableCell className="text-right px-2 md:px-4">
                  {log.result === "success" ? "✅" : "❌"}
                </TableCell>
                <TableCell className="text-right px-2 md:px-4 text-sm md:text-base">
                  {log.note || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};