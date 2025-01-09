import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartBar } from "lucide-react";
import { GameHistoryItem } from "./types";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GameSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameHistoryItem;
}

export const GameSummaryDialog = ({ isOpen, onClose, game }: GameSummaryDialogProps) => {
  const calculateStats = () => {
    if (!game.match_actions || !game.pre_match_report?.actions) return [];
    
    const actions = Array.isArray(game.pre_match_report.actions) 
      ? game.pre_match_report.actions 
      : [];

    return actions.map((action: any) => {
      const actionLogs = game.match_actions?.filter(log => log.action_id === action.id) || [];
      const totalAttempts = actionLogs.length;
      const successfulAttempts = actionLogs.filter(log => log.result === "success").length;
      const goalTarget = action.goal ? parseInt(action.goal) : totalAttempts || 1;
      const completionRate = Math.min((totalAttempts / goalTarget) * 100, 100);
      const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

      return {
        name: action.name,
        totalAttempts,
        successfulAttempts,
        goalTarget,
        completionRate,
        successRate
      };
    });
  };

  const stats = calculateStats();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartBar className="h-5 w-5" />
            סיכום משחק ויזואלי
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          <div className="space-y-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold mb-4">{stat.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ביצוע מול יעד</span>
                      <span dir="ltr">{stat.totalAttempts}/{stat.goalTarget}</span>
                    </div>
                    <Progress value={stat.completionRate} className="h-2" />
                    <div className="text-sm text-right text-muted-foreground mt-1">
                      {stat.completionRate.toFixed(1)}% הושלמו
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>אחוז הצלחה</span>
                      <span dir="ltr">{stat.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stat.successRate} className="h-2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};