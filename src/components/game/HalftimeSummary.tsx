import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { GameScore } from "./GameScore";

interface HalftimeSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSecondHalf: () => void;
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    minute: number;
    result: "success" | "failure";
    note?: string;
  }>;
}

const HALFTIME_TIPS = [
  "שחק בחדות!",
  "המשך להרים את הראש",
  "שמור על ריכוז גבוה!",
  "תן את המקסימום!",
  "המשך להילחם על כל כדור!",
];

export const HalftimeSummary = ({
  isOpen,
  onClose,
  onStartSecondHalf,
  actions,
  actionLogs,
}: HalftimeSummaryProps) => {
  const randomTip = HALFTIME_TIPS[Math.floor(Math.random() * HALFTIME_TIPS.length)];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-right">סיכום מחצית ראשונה</h2>
          
          <GameScore actionLogs={actionLogs} />
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-lg font-medium text-center text-yellow-800">
              טיפ למחצית השנייה:
            </p>
            <p className="text-center text-yellow-700 mt-2">{randomTip}</p>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button onClick={onStartSecondHalf} className="bg-primary">
              התחל מחצית שנייה
            </Button>
            <Button onClick={onClose} variant="outline">
              סגור
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};