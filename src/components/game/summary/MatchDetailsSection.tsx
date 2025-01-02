import { Badge } from "@/components/ui/badge";

interface MatchDetailsSectionProps {
  matchData: any;
}

export const MatchDetailsSection = ({ matchData }: MatchDetailsSectionProps) => {
  return (
    <div data-section="match-details" className="border p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-right">פרטי המשחק</h3>
      <div className="space-y-2 text-right">
        <p>
          <span className="font-medium">תאריך: </span>
          {matchData.match_date}
        </p>
        {matchData.opponent && (
          <p>
            <span className="font-medium">נגד: </span>
            {matchData.opponent}
          </p>
        )}
        {matchData.location && (
          <p>
            <span className="font-medium">מיקום: </span>
            {matchData.location}
          </p>
        )}
        {matchData.match_type && (
          <p>
            <span className="font-medium">סוג משחק: </span>
            <Badge variant="secondary">{matchData.match_type}</Badge>
          </p>
        )}
      </div>
    </div>
  );
};