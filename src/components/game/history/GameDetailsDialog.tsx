import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Target, Heart, MessageSquare } from "lucide-react";
import { GameHistoryItem } from "./types";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
              <div className="space-y-6">
                {/* Havayot Section */}
                {game.pre_match_report.havaya && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        הוויות נבחרות
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {game.pre_match_report.havaya.split(',').map((havaya, index) => (
                          <Badge key={index} variant="secondary">
                            {havaya.trim()}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Goals Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      יעדים למשחק
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(game.pre_match_report.actions) &&
                        game.pre_match_report.actions.map((action: any, index: number) => (
                          <div
                            key={index}
                            className="border p-3 rounded-lg bg-muted/50"
                          >
                            <div className="font-medium">{action.name}</div>
                            {action.goal && (
                              <div className="text-sm text-muted-foreground mt-1">
                                יעד: {action.goal}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Questions & Answers Section */}
                {Array.isArray(game.pre_match_report.questions_answers) && 
                 game.pre_match_report.questions_answers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        תשובות לשאלון טרום משחק
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Match Actions Section */}
            <Card>
              <CardHeader>
                <CardTitle>נתוני משחק</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};