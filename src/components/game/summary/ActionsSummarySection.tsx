import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Action } from "@/components/ActionSelector";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActionsSummarySectionProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    minute: number;
    result: "success" | "failure";
    note?: string;
  }>;
}

export const ActionsSummarySection = ({ actions, actionLogs }: ActionsSummarySectionProps) => {
  const calculateStats = (actionId: string) => {
    const logs = actionLogs.filter(log => log.actionId === actionId);
    const total = logs.length;
    const successes = logs.filter(log => log.result === "success").length;
    const successRate = total > 0 ? (successes / total) * 100 : 0;

    return {
      total,
      successes,
      successRate,
      logs: logs.sort((a, b) => a.minute - b.minute)
    };
  };

  const calculateOverallStats = () => {
    const total = actionLogs.length;
    const successes = actionLogs.filter(log => log.result === "success").length;
    const successRate = total > 0 ? (successes / total) * 100 : 0;

    return {
      total,
      successes,
      successRate
    };
  };

  const overallStats = calculateOverallStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">סיכום פעולות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-primary/10 rounded-lg">
          <h4 className="font-semibold text-right mb-2">סטטיסטיקה כללית</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{overallStats.total}</div>
              <div className="text-sm text-muted-foreground">סה"כ פעולות</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{overallStats.successes}</div>
              <div className="text-sm text-muted-foreground">הצלחות</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(overallStats.successRate)}%</div>
              <div className="text-sm text-muted-foreground">אחוז הצלחה</div>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-6">
            {actions.map(action => {
              const stats = calculateStats(action.id);
              if (stats.total === 0) return null;

              return (
                <div key={action.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {stats.successes}/{stats.total}
                    </span>
                    <h4 className="font-medium">{action.name}</h4>
                  </div>
                  <Progress value={stats.successRate} className="h-2" />
                  
                  <div className="space-y-2 mt-2">
                    {stats.logs.map((log, index) => (
                      <div key={index} className="text-sm text-right flex justify-between items-center">
                        <span className="text-muted-foreground">{log.minute}'</span>
                        <div className="flex items-center gap-2">
                          <span>{log.result === "success" ? "✓" : "✗"}</span>
                          {log.note && <span className="text-muted-foreground">{log.note}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};