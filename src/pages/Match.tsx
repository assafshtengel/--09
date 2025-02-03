import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  XCircle,
  Activity,
  BarChart,
  Lightbulb
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { GameStats } from "@/components/game/GameStats";
import { GameInsights } from "@/components/game/GameInsights";
import { GameScore } from "@/components/game/GameScore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    actions: any;
    questions_answers: any;
    havaya?: string;
  };
  match_notes?: Array<{
    id: string;
    note: string;
    minute: number;
  }>;
  match_substitutions?: Array<{
    id: string;
    player_in: string;
    player_out: string;
    minute: number;
  }>;
}

export const Match = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id],
    queryFn: async () => {
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
          match_notes (
            id,
            note,
            minute
          ),
          match_substitutions (
            id,
            player_in,
            player_out,
            minute
          ),
          pre_match_report:pre_match_report_id (
            actions,
            questions_answers,
            havaya
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as MatchData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-500">שגיאה בטעינת המשחק</p>
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          חזור
        </Button>
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

  const transformedActions = match.match_actions?.map(action => ({
    actionId: action.action_id,
    result: action.result === 'success' ? 'success' as const : 'failure' as const
  })) || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-right"
      >
        <h1 className="text-2xl font-bold mb-2">
          {match.opponent ? `סיכום משחק נגד ${match.opponent}` : 'סיכום משחק'}
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
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                סטטיסטיקות משחק
              </CardTitle>
            </CardHeader>
            <CardContent>
              {match.match_actions && (
                <GameStats 
                  actions={match.pre_match_report?.actions || []} 
                  actionLogs={transformedActions}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                תובנות
              </CardTitle>
            </CardHeader>
            <CardContent>
              {match.match_actions && (
                <GameInsights actionLogs={transformedActions} />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {havayot.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
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
        </motion.div>
      )}

      {match.pre_match_report?.actions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
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
        </motion.div>
      )}

      {match.match_actions && match.match_actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
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
        </motion.div>
      )}

      {match.pre_match_report?.questions_answers && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">תשובות לשאלון</h2>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {Object.entries(match.pre_match_report.questions_answers).map(([key, value], index) => {
                    if (key === 'openEndedAnswers' && typeof value === 'object') {
                      return Object.entries(value as Record<string, string>).map(([question, answer], subIndex) => (
                        <div key={`${index}-${subIndex}`} className="border p-4 rounded-lg">
                          <p className="font-medium text-right mb-2">{String(question)}</p>
                          <p className="text-muted-foreground text-right">{String(answer)}</p>
                        </div>
                      ));
                    } else if (key === 'stressLevel' || key === 'selfRating') {
                      const label = key === 'stressLevel' ? 'רמת הלחץ לפני המשחק' : 'ציון עצמי למשחק';
                      return (
                        <div key={index} className="border p-4 rounded-lg">
                          <p className="font-medium text-right mb-2">{label}</p>
                          <p className="text-muted-foreground text-right">{String(value)} מתוך 10</p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="flex justify-end mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="ml-4"
        >
          חזור לרשימת המשחקים
        </Button>
      </div>
    </div>
  );
};
