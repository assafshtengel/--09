import { format } from "date-fns";

interface SummaryHeaderProps {
  gamePhase: "halftime" | "ended";
  matchId?: string;
  opponent?: string;
}

export const SummaryHeader = ({ gamePhase, matchId, opponent }: SummaryHeaderProps) => {
  return (
    <div className="text-right border-b pb-4">
      <h2 className="text-xl md:text-2xl font-bold mb-2">
        {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
        {opponent && ` מול ${opponent}`}
      </h2>
      <div className="flex flex-col gap-1 text-sm md:text-base text-muted-foreground">
        <p>{format(new Date(), 'dd/MM/yyyy')}</p>
        {matchId && <p className="text-xs md:text-sm">מזהה משחק: {matchId}</p>}
      </div>
    </div>
  );
};