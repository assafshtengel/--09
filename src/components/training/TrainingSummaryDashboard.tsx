import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrainingSummaryForm } from "./TrainingSummaryForm";
import { TrainingSummaryList } from "./TrainingSummaryList";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { TrainingSummary } from "./types";

export const TrainingSummaryDashboard = () => {
  const [summaries, setSummaries] = useState<TrainingSummary[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadTrainingSummaries();
  }, []);

  const loadTrainingSummaries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('training_summaries')
        .select('*')
        .eq('player_id', user.id)
        .order('training_date', { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error('Error loading summaries:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את סיכומי האימונים",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">סיכום אימון</h2>
        <TrainingSummaryForm onSubmitSuccess={loadTrainingSummaries} />
      </Card>

      {summaries.length > 0 && (
        <Card className="p-6">
          <TrainingSummaryList summaries={summaries} />
        </Card>
      )}
    </div>
  );
};