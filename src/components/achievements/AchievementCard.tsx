import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AchievementCardProps {
  title: string;
  description: string;
  progress: number;
  points: number;
  isCompleted: boolean;
}

export const AchievementCard = ({
  title,
  description,
  progress,
  points,
  isCompleted,
}: AchievementCardProps) => {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={isCompleted ? "default" : "secondary"}>
            {points} נקודות
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {progress}% הושלם
        </p>
      </CardContent>
    </Card>
  );
};