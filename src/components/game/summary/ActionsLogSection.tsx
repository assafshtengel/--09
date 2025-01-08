import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Action } from "@/components/ActionSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // Sort logs by minute
  const sortedLogs = [...actionLogs].sort((a, b) => a.minute - b.minute);

  return (
    <div className="space-y-2">
      <h3 className="text-lg md:text-xl font-semibold text-right">פעולות במשחק</h3>
      <ScrollArea className="h-[300px] w-full rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right whitespace-nowrap px-2 md:px-4">דקה</TableHead>
              <TableHead className="text-right whitespace-nowrap px-2 md:px-4">פעולה</TableHead>
              <TableHead className="text-right whitespace-nowrap px-2 md:px-4">תוצאה</TableHead>
              <TableHead className="text-right hidden md:table-cell">הערה</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell className="px-2 md:px-4">{log.minute}'</TableCell>
                <TableCell className="text-right px-2 md:px-4 text-sm md:text-base">
                  {actions.find(a => a.id === log.actionId)?.name}
                </TableCell>
                <TableCell className="px-2 md:px-4">
                  {log.result === "success" ? "✅" : "❌"}
                </TableCell>
                <TableCell className="text-right hidden md:table-cell">
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