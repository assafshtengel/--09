import { Action } from "@/components/ActionSelector";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { GameStats } from "./GameStats";
import { GameInsights } from "./GameInsights";

interface ActionLog {
  actionId: string;
  minute: number;
  result: "success" | "failure";
  note?: string;
}

interface SubstitutionLog {
  playerIn: string;
  playerOut: string;
  minute: number;
}

interface GameSummaryProps {
  actions: Action[];
  actionLogs: ActionLog[];
  generalNotes: Array<{ text: string; minute: number }>;
  substitutions: SubstitutionLog[];
  onClose: () => void;
}

export const GameSummary = ({ 
  actions, 
  actionLogs, 
  generalNotes,
  substitutions,
  onClose 
}: GameSummaryProps) => {
  const takeScreenshot = async () => {
    try {
      const element = document.getElementById('game-summary');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `game-summary-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success("צילום מסך נשמר בהצלחה");
      }
    } catch (error) {
      toast.error("שגיאה בשמירת צילום המסך");
    }
  };

  const calculateScore = () => {
    const successPoints = 10;
    const failurePoints = -5;
    
    return actionLogs.reduce((total, log) => {
      return total + (log.result === "success" ? successPoints : failurePoints);
    }, 0);
  };

  const firstHalfLogs = actionLogs.filter(log => log.minute <= 45);
  const secondHalfLogs = actionLogs.filter(log => log.minute > 45);

  return (
    <div id="game-summary" className="space-y-8 p-6 bg-background">
      {/* Header */}
      <div className="text-right">
        <h2 className="text-2xl font-bold mb-2">סיכום משחק</h2>
        <p className="text-muted-foreground">
          {format(new Date(), 'dd/MM/yyyy')}
        </p>
      </div>

      {/* Overall Stats */}
      <GameStats actions={actions} actionLogs={actionLogs} />

      {/* Game Insights */}
      <GameInsights actionLogs={actionLogs} />

      {/* Score */}
      <div className="p-4 border rounded-lg bg-primary/10">
        <h3 className="text-xl font-semibold text-right mb-2">ציון משחק</h3>
        <p className="text-3xl font-bold text-center">{calculateScore()}</p>
      </div>

      {/* General Notes */}
      {generalNotes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-right">הערות כלליות</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">דקה</TableHead>
                <TableHead className="text-right">הערה</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generalNotes.map((note, index) => (
                <TableRow key={index}>
                  <TableCell>{note.minute}'</TableCell>
                  <TableCell>{note.text}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Substitutions */}
      {substitutions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-right">חילופים</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">דקה</TableHead>
                <TableHead className="text-right">שחקן יוצא</TableHead>
                <TableHead className="text-right">שחקן נכנס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {substitutions.map((sub, index) => (
                <TableRow key={index}>
                  <TableCell>{sub.minute}'</TableCell>
                  <TableCell>{sub.playerOut}</TableCell>
                  <TableCell>{sub.playerIn}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Action Logs Table */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-right">פעולות מחצית ראשונה</h3>
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
            {firstHalfLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{log.minute}'</TableCell>
                <TableCell>
                  {actions.find(a => a.id === log.actionId)?.name}
                </TableCell>
                <TableCell>
                  {log.result === "success" ? "✅" : "❌"}
                </TableCell>
                <TableCell>{log.note || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h3 className="text-xl font-semibold text-right mt-8">פעולות מחצית שנייה</h3>
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
            {secondHalfLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{log.minute}'</TableCell>
                <TableCell>
                  {actions.find(a => a.id === log.actionId)?.name}
                </TableCell>
                <TableCell>
                  {log.result === "success" ? "✅" : "❌"}
                </TableCell>
                <TableCell>{log.note || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Export Options */}
      <div className="flex justify-end gap-4">
        <Button onClick={takeScreenshot}>
          שמור צילום מסך
        </Button>
        <Button onClick={onClose} variant="outline">
          סגור
        </Button>
      </div>
    </div>
  );
};