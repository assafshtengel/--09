import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface GameMatchDetailsProps {
  matchData: {
    match_date?: string;
    opponent?: string;
    location?: string;
    player_role?: string;
    team_name?: string;
    match_type?: string;
  };
}

export const GameMatchDetails = ({ matchData }: GameMatchDetailsProps) => {
  if (!matchData) return null;

  return (
    <div className="bg-white p-4 border-b">
      <div className="flex flex-col gap-2 text-right">
        <div className="flex justify-between items-center">
          <Badge variant="outline">{matchData.match_type || 'ידידותי'}</Badge>
          <h2 className="text-lg font-semibold">
            {matchData.opponent ? `נגד ${matchData.opponent}` : 'משחק חדש'}
          </h2>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          {matchData.match_date && (
            <p>תאריך: {format(new Date(matchData.match_date), 'dd/MM/yyyy')}</p>
          )}
          {matchData.location && <p>מיקום: {matchData.location}</p>}
          {matchData.player_role && <p>תפקיד: {matchData.player_role}</p>}
          {matchData.team_name && <p>קבוצה: {matchData.team_name}</p>}
        </div>
      </div>
    </div>
  );
};