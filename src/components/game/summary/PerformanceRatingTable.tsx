import { useState } from "react";

interface PerformanceRatingTableProps {
  ratings: Record<string, number>;
  onRatingChange: (aspect: string, rating: number) => void;
}

export const PerformanceRatingTable = ({
  ratings,
  onRatingChange,
}: PerformanceRatingTableProps) => {
  const aspects = [
    { id: "technique", label: "טכניקה אישית" },
    { id: "decisions", label: "קבלת החלטות" },
    { id: "teamwork", label: "עזרה לקבוצה" },
    { id: "positioning", label: "מיקום ותנועה" },
    { id: "communication", label: "תקשורת" },
    { id: "physical", label: "יכולת פיזית" },
    { id: "mental", label: "חוסן מנטלי" },
  ];

  return (
    <div className="border p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-right">דירוג ביצועים</h3>
      <div className="space-y-4">
        {aspects.map((aspect) => (
          <div key={aspect.id} className="flex flex-row-reverse items-center gap-4">
            <div className="flex-1 text-right">{aspect.label}</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onRatingChange(aspect.id, rating)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    ratings[aspect.id] === rating
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};