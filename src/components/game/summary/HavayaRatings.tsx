import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

interface HavayaRatingsProps {
  matchId: string | undefined;
  onRatingsChange: (ratings: Record<string, number>) => void;
}

export const HavayaRatings = ({ matchId, onRatingsChange }: HavayaRatingsProps) => {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadRatings = async () => {
      if (!matchId) return;

      try {
        const { data, error } = await supabase
          .from('post_game_feedback')
          .select('havaya_ratings')
          .eq('match_id', matchId)
          .maybeSingle();

        if (error) throw error;
        
        if (data?.havaya_ratings && typeof data.havaya_ratings === 'object') {
          setRatings(data.havaya_ratings as Record<string, number>);
        }
      } catch (error) {
        console.error('Error loading havaya ratings:', error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את דירוגי ההוויה",
          variant: "destructive",
        });
      }
    };

    loadRatings();
  }, [matchId]);

  const handleRatingChange = (havaya: string, value: number) => {
    const newRatings = { ...ratings, [havaya]: value };
    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  const havayotList = [
    "הנאה",
    "מוטיבציה",
    "ביטחון",
    "מיקוד",
    "רוגע",
    "אנרגיה"
  ];

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-right mb-4">דירוג הוויות במשחק</h3>
        <div className="space-y-6">
          {havayotList.map((havaya) => (
            <div key={havaya} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {ratings[havaya] || 0}/10
                </span>
                <label className="text-sm font-medium">{havaya}</label>
              </div>
              <Slider
                value={[ratings[havaya] || 0]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => handleRatingChange(havaya, value[0])}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};