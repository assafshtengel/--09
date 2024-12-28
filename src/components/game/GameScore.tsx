interface GameScoreProps {
  actionLogs: Array<{ result: "success" | "failure" }>;
}

export const GameScore = ({ actionLogs }: GameScoreProps) => {
  const calculateScore = () => {
    const successPoints = 10;
    const failurePoints = -5;
    
    const score = actionLogs.reduce((total, log) => {
      return total + (log.result === "success" ? successPoints : failurePoints);
    }, 0);

    return Math.max(0, score); // Score cannot be negative
  };

  return (
    <div className="p-4 border rounded-lg bg-primary/10 mt-6">
      <h3 className="text-xl font-semibold text-right mb-2">ציון</h3>
      <p className="text-3xl font-bold text-center">{calculateScore()}</p>
    </div>
  );
};