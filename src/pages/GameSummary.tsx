import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/types/game";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GameSummary() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת",
          variant: "destructive",
        });
        return;
      }

      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('player_id', user.id)
        .order('match_date', { ascending: false });

      if (error) throw error;

      setMatches(matches || []);
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את המשחקים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewGame = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת",
          variant: "destructive",
        });
        return;
      }

      const { data: match, error } = await supabase
        .from('matches')
        .insert([
          { 
            player_id: user.id,
            status: 'preview',
            match_date: new Date().toISOString().split('T')[0]
          }
        ])
        .select()
        .single();

      if (error) throw error;

      navigate(`/game/${match.id}`);
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן ליצור משחק חדש",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">סיכומי משחקים</h1>
        <Button onClick={handleStartNewGame}>
          משחק חדש
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center">טוען...</div>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">אין משחקים עדיין</p>
            <Button onClick={handleStartNewGame} className="mt-4">
              התחל משחק חדש
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match.id} className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => navigate(`/game/${match.id}`)}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{match.opponent || 'ללא יריבה'}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(match.match_date).toLocaleDateString('he-IL')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {match.status === 'preview' ? 'טרם התחיל' :
                       match.status === 'playing' ? 'במהלך המשחק' :
                       match.status === 'ended' ? 'הסתיים' : match.status}
                    </span>
                    {match.final_score && (
                      <span className="font-semibold">{match.final_score}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}