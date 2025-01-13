import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface GamePreviewProps {
  match: {
    match_date: string;
    match_time?: string;
    opponent?: string;
    location?: string;
  };
  onStart: () => void;
}

export const GamePreview = ({ match, onStart }: GamePreviewProps) => {
  const matchDate = new Date(match.match_date);
  const formattedDate = format(matchDate, "EEEE, d בMMMM", { locale: he });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">משחק קרוב</h2>
              <p className="text-muted-foreground">פרטי המשחק הבא שלך</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>

          {match.match_time && (
            <div className="flex items-center gap-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{match.match_time}</span>
            </div>
          )}

          {match.opponent && (
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>נגד {match.opponent}</span>
            </div>
          )}

          {match.location && (
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <span>{match.location}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onStart} size="lg">
          המשך
        </Button>
      </div>
    </div>
  );
};