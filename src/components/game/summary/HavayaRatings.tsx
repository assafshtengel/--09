import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HavayaRatingsProps {
  matchId: string | undefined;
  onRatingsChange: (ratings: Record<string, number>) => void;
}

export const HavayaRatings = ({ matchId, onRatingsChange }: HavayaRatingsProps) => {
  const [havayot, setHavayot] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchHavayot = async () => {
      if (!matchId) return;

      try {
        const { data: match } = await supabase
          .from('matches')
          .select('pre_match_report_id')
          .eq('id', matchId)
          .single();

        if (match?.pre_match_report_id) {
          const { data: report } = await supabase
            .from('pre_match_reports')
            .select('havaya')
            .eq('id', match.pre_match_report_id)
            .single();

          if (report?.havaya) {
            const havayaList = report.havaya.split(',').map(h => h.trim());
            setHavayot(havayaList);
            
            // Initialize ratings with 5 as default value
            const initialRatings = Object.fromEntries(
              havayaList.map(h => [h, 5])
            );
            setRatings(initialRatings);
            onRatingsChange(initialRatings);
          }
        }
      } catch (error) {
        console.error('Error fetching havayot:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את ההוויות",
          variant: "destructive",
        });
      }
    };

    fetchHavayot();
  }, [matchId]);

  const handleRatingChange = (havaya: string, value: number[]) => {
    const newRatings = { ...ratings, [havaya]: value[0] };
    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  if (havayot.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">דירוג הוויות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-right text-muted-foreground">
            דרג עד כמה הצלחת להגשים כל אחת מההוויות שבחרת למשחק
          </p>
          {havayot.map((havaya) => (
            <div key={havaya} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {ratings[havaya] || 5}/10
                </span>
                <Label className="text-right">{havaya}</Label>
              </div>
              <Slider
                value={[ratings[havaya] || 5]}
                onValueChange={(value) => handleRatingChange(havaya, value)}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};