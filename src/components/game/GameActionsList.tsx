import { Action } from "@/components/ActionSelector";
import { ActionItem } from "./ActionItem";
import { useEffect, useState } from "react";

interface GameActionsListProps {
  actions: Action[];
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
  }>;
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
  matchId: string;
  minute: number;
}

export const GameActionsList = ({ actions, actionLogs, onLog, matchId, minute }: GameActionsListProps) => {
  const [stats, setStats] = useState<Record<string, { success: number; total: number }>>({});

  useEffect(() => {
    const newStats = actions.reduce((acc, action) => {
      const results = actionLogs.filter(log => log.actionId === action.id);
      const successCount = results.filter(log => log.result === "success").length;
      
      acc[action.id] = {
        success: successCount,
        total: results.length
      };
      
      return acc;
    }, {} as Record<string, { success: number; total: number }>);
    
    setStats(newStats);
  }, [actions, actionLogs]);

  const handleLog = async (actionId: string, result: "success" | "failure", note?: string) => {
    await onLog(actionId, result, note);
    
    // Update local stats immediately
    setStats(prevStats => {
      const currentStats = prevStats[actionId] || { success: 0, total: 0 };
      return {
        ...prevStats,
        [actionId]: {
          success: result === "success" ? currentStats.success + 1 : currentStats.success,
          total: currentStats.total + 1
        }
      };
    });
  };

  return (
    <div className="grid gap-3">
      {actions.map(action => (
        <ActionItem
          key={action.id}
          action={action}
          stats={stats[action.id] || { success: 0, total: 0 }}
          onLog={handleLog}
          matchId={matchId}
          minute={minute}
        />
      ))}
    </div>
  );
};