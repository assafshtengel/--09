import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { GameHistoryItem } from "./types";

interface GameDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameHistoryItem;
}

export const GameDetailsDialog = ({ isOpen, onClose, game }: GameDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            פרטי משחק
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          <div className="space-y-6">
            {game.pre_match_report && (
              <div>
                <h3 className="font-semibold mb-2">נתוני טרום משחק</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium">יעדים</h4>
                    <ul className="list-disc list-inside">
                      {Array.isArray(game.pre_match_report.actions) &&
                        game.pre_match_report.actions.map((action: any, index: number) => (
                          <li key={index}>
                            {action.name} - יעד: {action.goal || "לא הוגדר"}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">נתוני משחק</h3>
              {game.match_actions && game.match_actions.length > 0 ? (
                <ul className="space-y-2">
                  {game.match_actions.map((action) => (
                    <li key={action.id} className="flex justify-between">
                      <span>{action.result}</span>
                      <span>דקה {action.minute}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">אין נתוני משחק</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};