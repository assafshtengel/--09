import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { GameHistoryItem } from "./types";
import { motion } from "framer-motion";

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

                  {Array.isArray(game.pre_match_report.questions_answers) && 
                   game.pre_match_report.questions_answers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <h4 className="text-sm font-medium mb-3">תשובות לשאלון טרום משחק</h4>
                      <div className="space-y-4">
                        {game.pre_match_report.questions_answers.map((qa: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border p-4 rounded-lg bg-gray-50/50"
                          >
                            <p className="font-medium text-right mb-2">{qa.question}</p>
                            <p className="text-gray-600 text-right">{qa.answer}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
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