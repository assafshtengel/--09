interface GameInsightsProps {
  actionLogs: Array<{
    actionId: string;
    result: "success" | "failure";
  }>;
}

export const GameInsights = ({ actionLogs }: GameInsightsProps) => {
  const generateInsights = () => {
    const totalActions = actionLogs.length;
    if (totalActions === 0) return "אין מספיק נתונים להצגת תובנות";

    const successfulActions = actionLogs.filter(log => log.result === "success").length;
    const successRate = (successfulActions / totalActions) * 100;

    if (successRate >= 75) {
      return "ביצוע מצוין! שמור על רמת הביצועים הגבוהה";
    } else if (successRate >= 50) {
      return "ביצוע טוב, יש מקום לשיפור בדיוק הביצוע";
    } else {
      return "כדאי להתמקד בשיפור הדיוק והביצוע של הפעולות";
    }
  };

  return (
    <div className="p-4 bg-primary/10 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-right">תובנות משחק</h3>
      <p className="text-right">{generateInsights()}</p>
    </div>
  );
};