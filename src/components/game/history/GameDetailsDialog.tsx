import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Target, Heart, MessageSquare, Clock, MapPin, Trophy, User } from "lucide-react";
import { GameHistoryItem } from "./types";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { he } from "date-fns/locale";

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
            {/* Basic Match Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  מידע בסיסי
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(game.match_date), "dd/MM/yyyy", { locale: he })}</span>
                </div>
                {game.opponent && (
                  <div className="flex items-center justify-between">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>נגד: {game.opponent}</span>
                  </div>
                )}
                {game.location && (
                  <div className="flex items-center justify-between">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{game.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

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
                {Array.isArray(game.pre_match_report.actions) && game.pre_match_report.actions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        יעדים למשחק
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {game.pre_match_report.actions.map((action: any, index: number) => (
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
                )}

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
            {game.match_actions && game.match_actions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>נתוני משחק</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {game.match_actions.map((action, index) => (
                      <div 
                        key={index} 
                        className={`flex justify-between p-2 rounded-lg ${
                          action.result === 'success' ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <span className={action.result === 'success' ? 'text-green-600' : 'text-red-600'}>
                          {action.result === 'success' ? 'הצלחה' : 'כישלון'}
                        </span>
                        <span>דקה {action.minute}</span>
                        {action.note && (
                          <span className="text-sm text-muted-foreground">{action.note}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};