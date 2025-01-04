import { format } from "date-fns";

interface PreMatchHeaderProps {
  matchDate: string;
  opponent?: string;
  position?: string;
}

export const PreMatchHeader = ({ matchDate, opponent, position }: PreMatchHeaderProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Invalid date:', dateString);
      return 'תאריך לא תקין';
    }
  };

  return (
    <div className="border-b pb-4">
      <h2 className="text-2xl font-bold text-right">דוח טרום משחק</h2>
      <p className="text-muted-foreground text-right">
        תאריך: {formatDate(matchDate)}
        {opponent && ` | נגד: ${opponent}`}
        {position && ` | תפקיד: ${position}`}
      </p>
    </div>
  );
};