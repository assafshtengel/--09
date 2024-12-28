import { format } from "date-fns";

interface SummaryHeaderProps {
  gamePhase: "halftime" | "ended";
}

export const SummaryHeader = ({ gamePhase }: SummaryHeaderProps) => {
  return (
    <div className="text-right border-b pb-4">
      <h2 className="text-2xl font-bold mb-2">
        {gamePhase === "halftime" ? "סיכום מחצית" : "סיכום משחק"}
      </h2>
      <p className="text-muted-foreground">
        {format(new Date(), 'dd/MM/yyyy')}
      </p>
    </div>
  );
};