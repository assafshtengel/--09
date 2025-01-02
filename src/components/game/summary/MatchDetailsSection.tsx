import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MatchDetailsSectionProps {
  matchData: {
    match_date: string;
    match_time?: string;
    opponent?: string;
    final_score?: string;
    player_position?: string;
    team?: string;
  };
}

export const MatchDetailsSection = ({ matchData }: MatchDetailsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">פרטי משחק</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-right">
          <div>
            <p className="text-sm text-muted-foreground">תאריך ושעה</p>
            <p className="font-medium">
              {format(new Date(matchData.match_date), "dd/MM/yyyy")}
              {matchData.match_time && ` ${matchData.match_time}`}
            </p>
          </div>
          {matchData.opponent && (
            <div>
              <p className="text-sm text-muted-foreground">קבוצה יריבה</p>
              <p className="font-medium">{matchData.opponent}</p>
            </div>
          )}
          {matchData.final_score && (
            <div>
              <p className="text-sm text-muted-foreground">תוצאה סופית</p>
              <p className="font-medium">{matchData.final_score}</p>
            </div>
          )}
          {matchData.player_position && (
            <div>
              <p className="text-sm text-muted-foreground">תפקיד</p>
              <p className="font-medium">{matchData.player_position}</p>
            </div>
          )}
          {matchData.team && (
            <div>
              <p className="text-sm text-muted-foreground">קבוצה</p>
              <p className="font-medium">{matchData.team}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};