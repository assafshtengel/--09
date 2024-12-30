import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PlayerLevelProps {
  level: number;
  points: number;
  pointsToNextLevel: number;
}

export const PlayerLevel = ({ level, points, pointsToNextLevel }: PlayerLevelProps) => {
  const progress = (points / pointsToNextLevel) * 100;

  return (
    <Card className="bg-primary/10">
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">רמה {level}</h2>
          <p className="text-sm text-muted-foreground">
            {points} / {pointsToNextLevel} נקודות לרמה הבאה
          </p>
        </div>
        <Progress value={progress} className="h-3" />
      </CardContent>
    </Card>
  );
};