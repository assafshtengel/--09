import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ActionsLogSectionProps {
  actions: Array<{
    id: string;
    name: string;
  }>;
  actionLogs: Array<{
    actionId: string;
    minute: number;
    result: "success" | "failure";
    note?: string;
  }>;
}

export const ActionsLogSection = ({ actions, actionLogs }: ActionsLogSectionProps) => {
  const formatMinute = (minute: number) => {
    if (minute <= 45) {
      return `${minute} (1)`;
    } else {
      return `${minute - 45} (2)`;
    }
  };

  const sortedLogs = [...actionLogs].sort((a, b) => a.minute - b.minute);

  return (
    <Card>
      <CardHeader>
        <CardTitle>יומן פעולות</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          <div className="space-y-2">
            {sortedLogs.map((log, index) => {
              const action = actions.find(a => a.id === log.actionId);
              if (!action) return null;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {log.result === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      דקה {formatMinute(log.minute)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{action.name}</span>
                    {log.note && (
                      <p className="text-sm text-muted-foreground mt-1">{log.note}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};