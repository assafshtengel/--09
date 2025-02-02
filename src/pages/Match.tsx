import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { 
  Target, 
  Calendar,
  Heart,
  MessageSquare,
  User,
  MapPin,
  Trophy,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

interface MatchData {
  id: string;
  player_id: string;
  created_at: string;
  match_date: string;
  opponent: string | null;
  location: string | null;
  status: string;
  pre_match_report_id: string | null;
  match_type: string | null;
  final_score: string | null;
  player_position: string | null;
  team: string | null;
  team_name: string | null;
  player_role: string | null;
  match_actions?: Array<{
    id: string;
    action_id: string;
    minute: number;
    result: string;
    note: string | null;
  }>;
  pre_match_report?: {
    actions: Json;
    questions_answers: Json;
    havaya?: string;
  };
}

export const Match = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
      if (!id) throw new Error('No match ID provided');

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_actions (
            id,
            action_id,
            minute,
            result,
            note
          ),
          pre_match_report:pre_match_report_id (
            actions,
            questions_answers,
            havaya
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching match:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Match not found');
      }

      return data as MatchData;
    },
    enabled: Boolean(id),
    meta: {
      onError: () => {
        toast({
          title: "שגיאה",
          description: "שגיאה בטעינת המשחק",
          variant: "destructive",
        });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">שגיאה בטעינת המשחק</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-muted-foreground">לא נמצא משחק</p>
      </div>
    );
  }

  const havayot = match.pre_match_report?.havaya ? 
    match.pre_match_report.havaya.split(',').map(h => h.trim()) : [];

  const calculateActionStats = (actionName: string) => {
    if (!match.match_actions) return { success: 0, total: 0, rate: 0 };
    
    const actionAttempts = match.match_actions.filter(a => a.action_id === actionName);
    const successCount = actionAttempts.filter(a => a.result === 'success').length;
    const total = actionAttempts.length;
    
    return {
      success: successCount,
      total,
      rate: total > 0 ? (successCount / total) * 100 : 0
    };
  };

  const isJsonArray = (value: Json): value is Json[] => {
    return Array.isArray(value);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-right">
        <h1 className="text-2xl font-bold mb-2">
          {match.opponent ? `משחק נגד ${match.opponent}` : 'משחק'}
        </h1>
        <div className="flex flex-wrap gap-4 justify-end items-center text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(match.match_date), "dd/MM/yyyy", { locale: he })}
          </div>
          {match.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {match.location}
            </div>
          )}
          {match.match_type && (
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              {match.match_type === 'friendly' ? 'ידידות' : 'ליגה'}
            </div>
          )}
        </div>
      </div>

      {match.player_position && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">תפקיד במשחק</h2>
            </div>
            <p className="text-right">{match.player_position}</p>
          </CardContent>
        </Card>
      )}

      {havayot.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">הוויות נבחרות</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {havayot.map((havaya, index) => (
                <Badge key={index} variant="secondary" className="text-base py-2">
                  {havaya}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {match.pre_match_report?.actions && isJsonArray(match.pre_match_report.actions) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">יעדים והישגים במשחק</h2>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {match.pre_match_report.actions.map((action: any, index: number) => {
                  const stats = calculateActionStats(action.name);
                  return (
                    <div key={index} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{stats.success}/{stats.total}</span>
                        </div>
                        <h3 className="font-semibold">{action.name}</h3>
                      </div>
                      <Progress value={stats.rate} className="h-2 mb-2" />
                      {action.goal && (
                        <p className="text-sm text-muted-foreground text-right mt-2">
                          יעד: {action.goal}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {match.match_actions && match.match_actions.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">פעולות במשחק</h2>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {match.match_actions.map((action, index) => (
                  <div key={index} className="border p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {action.result === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">{action.minute}'</span>
                      </div>
                      <span className="font-medium">{action.action_id}</span>
                    </div>
                    {action.note && (
                      <p className="text-sm text-muted-foreground mt-2 text-right">
                        {action.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {match.pre_match_report?.questions_answers && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">תשובות לשאלון</h2>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {Object.entries(match.pre_match_report.questions_answers as Record<string, any>).map(([key, value], index) => {
                  if (key === 'openEndedAnswers' && typeof value === 'object') {
                    return Object.entries(value as Record<string, string>).map(([question, answer], subIndex) => (
                      <div key={`${index}-${subIndex}`} className="border p-4 rounded-lg">
                        <p className="font-medium text-right mb-2">{question}</p>
                        <p className="text-muted-foreground text-right">{answer}</p>
                      </div>
                    ));
                  } else if (key === 'stressLevel') {
                    return (
                      <div key={index} className="border p-4 rounded-lg">
                        <p className="font-medium text-right mb-2">רמת הלחץ לפני המשחק</p>
                        <p className="text-muted-foreground text-right">{value} מתוך 10</p>
                      </div>
                    );
                  } else if (key === 'selfRating') {
                    return (
                      <div key={index} className="border p-4 rounded-lg">
                        <p className="font-medium text-right mb-2">ציון עצמי למשחק</p>
                        <p className="text-muted-foreground text-right">{value} מתוך 10</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
