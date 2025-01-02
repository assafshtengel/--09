import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PerformanceRatingTableProps {
  ratings: Record<string, number>;
  onRatingChange: (aspect: string, rating: number) => void;
  isEditable?: boolean;
}

const PERFORMANCE_ASPECTS = [
  "טכניקה אישית",
  "קבלת החלטות",
  "עזרה לעבודה הקבוצתית",
  "התמודדות עם לחץ",
  "כושר גופני",
  "מנהיגות",
  "אישיות מקצועית",
  "הבנה וגישה למשחק",
  "חיוביות"
];

export const PerformanceRatingTable = ({ 
  ratings, 
  onRatingChange,
  isEditable = true 
}: PerformanceRatingTableProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-right">דירוג ביצועים</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">היבט</TableHead>
            {[1, 2, 3, 4, 5].map(rating => (
              <TableHead key={rating} className="text-center">
                {rating}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERFORMANCE_ASPECTS.map(aspect => (
            <TableRow key={aspect}>
              <TableCell className="text-right">{aspect}</TableCell>
              {[1, 2, 3, 4, 5].map(rating => (
                <TableCell key={rating} className="text-center">
                  <input
                    type="radio"
                    name={aspect}
                    checked={ratings[aspect] === rating}
                    onChange={() => isEditable && onRatingChange(aspect, rating)}
                    disabled={!isEditable}
                    className="h-4 w-4"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};