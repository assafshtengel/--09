import { Card } from "@/components/ui/card";

interface AIInsightsProps {
  insights: string;
}

export const AIInsights = ({ insights }: AIInsightsProps) => {
  if (!insights) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <h3 className="text-xl font-bold mb-4 text-right">תובנות מקצועיות</h3>
      <div className="text-right whitespace-pre-line">{insights}</div>
    </Card>
  );
};