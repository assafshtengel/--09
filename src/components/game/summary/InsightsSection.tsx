import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface InsightsSectionProps {
  insights: string;
  isLoading: boolean;
}

export const InsightsSection = ({ insights, isLoading }: InsightsSectionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-primary">טוען תובנות...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insightsList = insights.split('\n\n');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" />
          תובנות AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {insightsList.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
              >
                {index % 2 === 0 ? (
                  <Target className="h-5 w-5 text-primary shrink-0 mt-1" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-1" />
                )}
                <p className="text-right">{insight}</p>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};