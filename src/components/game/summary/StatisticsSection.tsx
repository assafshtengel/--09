import { Action } from "@/components/ActionSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Goal, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface StatisticsSectionProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
  }>;
}

export const StatisticsSection = ({ actions, actionLogs }: StatisticsSectionProps) => {
  const calculateStats = () => {
    const totalActions = actionLogs.length;
    const successfulActions = actionLogs.filter(log => log.result === "success").length;
    const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;

    return {
      totalActions,
      successfulActions,
      successRate
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/5 to-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Goal className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">אחוז הצלחה כללי</h3>
                <Progress value={stats.successRate} className="mt-2" />
                <p className="text-2xl font-bold mt-2">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {actions.map((action, index) => {
        const actionStats = actionLogs.filter(log => log.actionId === action.id);
        const successCount = actionStats.filter(log => log.result === "success").length;
        const successRate = actionStats.length > 0 ? (successCount / actionStats.length) * 100 : 0;

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/5 to-green-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {index % 2 === 0 ? (
                    <Shield className="h-8 w-8 text-primary" />
                  ) : (
                    <Activity className="h-8 w-8 text-primary" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{action.name}</h3>
                    <Progress value={successRate} className="mt-2" />
                    <p className="text-2xl font-bold mt-2">{successRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">
                      {successCount} הצלחות מתוך {actionStats.length} ניסיונות
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};