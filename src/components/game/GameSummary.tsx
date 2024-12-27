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
  gamePhase?: "halftime" | "ended";
  onContinueGame?: () => void;
}

export const GameSummary = ({ 
  actions, 
  actionLogs, 
  generalNotes,
  substitutions,
  onClose,
  gamePhase,
  onContinueGame
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

  const currentLogs = gamePhase === "halftime" 
    ? actionLogs.filter(log => log.minute <= 45)
    : actionLogs;

  return (
    <div id="game-summary" className="space-y-6 p-4 bg-background">
      {/* Header */}
      <div className="text-right border-b pb-4">
        <h2 className="text-2xl font-bold mb-2">
          {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
        </h2>
        <p className="text-muted-foreground">
          {format(new Date(), 'dd/MM/yyyy')}
        </p>
      </div>

      {/* Overall Stats */}
      <GameStats actions={actions} actionLogs={currentLogs} />

      {/* Game Insights */}
      <GameInsights actionLogs={currentLogs} />

      {/* Score */}
      <div className="p-4 border rounded-lg bg-primary/10">
        <h3 className="text-xl font-semibold text-right mb-2">ציון</h3>
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

      {/* Action Logs Table */}
      <div className="space-y-4">
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
            {currentLogs.map((log, index) => (
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
        {gamePhase === "halftime" && onContinueGame && (
          <Button onClick={() => {
            onContinueGame();
            onClose();
          }} variant="default">
            המשך למחצית שנייה
          </Button>
        )}
        <Button onClick={takeScreenshot} variant="outline">
          שמור צילום מסך
        </Button>
        <Button onClick={onClose} variant="outline">
          סגור
        </Button>
      </div>
    </div>
  );
};