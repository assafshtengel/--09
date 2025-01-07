import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const PERFORMANCE_ASPECTS = [
  "טכניקה אישית",
  "קבלת החלטות",
  "עזרה לעבודה הקבוצתית",
  "התמודדות עם לחץ",
  "כושר גופני",
  "מנהיגות",
  "משמעת אישית",
  "הכנה נכונה למשחק",
  "חיוביות"
];

interface PerformanceRatingsProps {
  onRatingsChange: (ratings: Record<string, number>) => void;
}

export const PerformanceRatings = ({ onRatingsChange }: PerformanceRatingsProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRatingChange = (aspect: string, rating: number) => {
    const newRatings = { ...ratings, [aspect]: rating };
    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>הערכת ביצועים</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-right mb-4">
              תן לעצמך ציון בכל אחד מהנושאים הבאים
            </h3>
            
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-right">נושא</th>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <th key={rating} className="text-center">
                      {rating === 1 ? (
                        <div className="text-center">
                          <span>חלש</span>
                          <span className="block text-sm text-gray-500">(1)</span>
                        </div>
                      ) : rating === 5 ? (
                        <div className="text-center">
                          <span>מצוין</span>
                          <span className="block text-sm text-gray-500">(5)</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">({rating})</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERFORMANCE_ASPECTS.map(aspect => (
                  <tr key={aspect}>
                    <td className="text-right py-2">{aspect}</td>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <td key={rating} className="text-center">
                        <input
                          type="radio"
                          name={aspect}
                          checked={ratings[aspect] === rating}
                          onChange={() => handleRatingChange(aspect, rating)}
                          className="h-4 w-4"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};