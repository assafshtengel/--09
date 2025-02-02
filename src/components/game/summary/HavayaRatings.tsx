import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

const HAVAYA_ASPECTS = [
  "הנאה",
  "מוטיבציה",
  "ביטחון",
  "מיקוד",
  "רוגע",
  "אנרגיה",
  "תקשורת",
  "מנהיגות"
];

interface HavayaRatingsProps {
  matchId: string | undefined;
  onRatingsChange: (ratings: Record<string, number>) => void;
}

export const HavayaRatings = ({ matchId, onRatingsChange }: HavayaRatingsProps) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadExistingRatings = async () => {
      if (!matchId) return;

      try {
        const { data, error } = await supabase
          .from('post_game_feedback')
          .select('havaya_ratings')
          .eq('match_id', matchId)
          .single();

        if (error) throw error;
        
        if (data?.havaya_ratings && typeof data.havaya_ratings === 'object') {
          setRatings(data.havaya_ratings as Record<string, number>);
        }
      } catch (error) {
        console.error('Error loading havaya ratings:', error);
      }
    };

    loadExistingRatings();
  }, [matchId]);

  const handleRatingChange = (aspect: string, value: number[]) => {
    const newRatings = { ...ratings, [aspect]: value[0] };
    setRatings(newRatings);
    onRatingsChange(newRatings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>דירוג חוויות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {HAVAYA_ASPECTS.map(aspect => (
          <div key={aspect} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {ratings[aspect] || 0}/10
              </span>
              <Label>{aspect}</Label>
            </div>
            <Slider
              value={[ratings[aspect] || 0]}
              onValueChange={(value) => handleRatingChange(aspect, value)}
              max={10}
              step={1}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};