import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TrainingSummary {
  id: string;
  training_date: string;
  training_time: string;
  satisfaction_rating: number;
  challenge_handling_rating: number;
  energy_focus_rating: number;
  questions_answers: Record<string, string>;
}

export const TrainingSummaryList = () => {
  const [summaries, setSummaries] = useState<TrainingSummary[]>([]);

  useEffect(() => {
    const fetchSummaries = async () => {
      const { data } = await supabase
        .from("training_summaries")
        .select("*")
        .order("training_date", { ascending: false });

      if (data) {
        setSummaries(data);
      }
    };

    fetchSummaries();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-right mb-4">סיכומי אימונים קודמים</h2>
      
      <Accordion type="single" collapsible className="w-full">
        {summaries.map((summary) => (
          <AccordionItem key={summary.id} value={summary.id}>
            <AccordionTrigger>
              {format(new Date(summary.training_date), "dd/MM/yyyy")} - {summary.training_time}
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">דירוגים</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>{summary.satisfaction_rating}/7</span>
                    <span>שביעות רצון</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{summary.challenge_handling_rating}/7</span>
                    <span>התמודדות עם אתגרים</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{summary.energy_focus_rating}/7</span>
                    <span>אנרגיה וריכוז</span>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">תשובות לשאלות</h4>
                    {Object.entries(summary.questions_answers).map(([question, answer], index) => (
                      <div key={index} className="mb-2">
                        <p className="font-medium text-right">{question}</p>
                        <p className="text-muted-foreground text-right">{answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};