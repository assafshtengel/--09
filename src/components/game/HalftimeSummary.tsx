import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";
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
}

export const HalftimeSummary = ({
  isOpen,
  onClose,
  onStartSecondHalf,
  actions,
  actionLogs,
}: HalftimeSummaryProps) => {
  // Sort action logs by minute
  const sortedLogs = [...actionLogs].sort((a, b) => a.minute - b.minute);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogTitle className="text-2xl font-bold text-right">סיכום מחצית ראשונה</DialogTitle>
        <DialogDescription className="sr-only">
          סיכום ביניים של המחצית הראשונה, כולל פעולות שבוצעו וטיפ למחצית השנייה
        </DialogDescription>
        
        <div className="space-y-6 p-4">
          <div className="p-4 border rounded-lg bg-primary/10">
            <h3 className="text-xl font-semibold text-right mb-2">תזכורת אישית למחצית השנייה</h3>
            <p className="text-lg text-center text-primary">
              "אני רוצה להמשיך להתמקד בבעיטות מדויקות לשער"
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-right mb-3">פעולות שבוצעו במחצית</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {sortedLogs.map((log, index) => {
                  const action = actions.find(a => a.id === log.actionId);
                  if (!action) return null;

                  return (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <span className="text-sm text-muted-foreground">
                        {log.result === "success" ? "✅" : "❌"}
                      </span>
                      <div className="flex-1 text-right mx-4">
                        <span className="font-medium">{action.name}</span>
                        {log.note && (
                          <p className="text-sm text-muted-foreground">{log.note}</p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        דקה {log.minute}'
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-center">
            <Button onClick={onStartSecondHalf} className="bg-primary">
              התחל מחצית שנייה
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};