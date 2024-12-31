import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
import { GameStats } from "./GameStats";
import { GameInsights } from "./GameInsights";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  generalNotes: Array<{ text: string; minute: number }>;
  havaya: string[];
}

export const HalftimeSummary = ({
  isOpen,
  onClose,
  onStartSecondHalf,
  actions,
  actionLogs,
  generalNotes,
  havaya,
}: HalftimeSummaryProps) => {
  const handleClose = () => {
    onStartSecondHalf();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <ScrollArea className="h-[80vh] md:h-[600px]">
          <div className="space-y-6 p-4">
            <h2 className="text-2xl font-bold text-right">סיכום מחצית ראשונה</h2>
            
            {havaya.length > 0 && (
              <div className="border p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-right">הוויות נבחרות</h3>
                <div className="flex flex-wrap gap-2 justify-end">
                  {havaya.map((h, index) => (
                    <Badge key={index} variant="secondary">
                      {h}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <GameStats actions={actions} actionLogs={actionLogs} />
            <GameInsights actionLogs={actionLogs} />

            {generalNotes.length > 0 && (
              <div className="border p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-right">הערות</h3>
                <div className="space-y-2">
                  {generalNotes.map((note, index) => (
                    <div key={index} className="text-right">
                      <span className="text-sm text-muted-foreground">{note.minute}'</span>
                      <p>{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <Button onClick={handleClose}>
                התחל מחצית שנייה
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};