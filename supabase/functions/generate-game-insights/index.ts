import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch current match data with all related information
    const { data: currentMatch, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        match_actions (
          action_id,
          result,
          minute
        ),
        pre_match_reports (
          actions
        ),
        match_notes (
          note
        ),
        player_id
      `)
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;

    // Calculate match statistics
    const totalActions = currentMatch.match_actions.length;
    const successfulActions = currentMatch.match_actions.filter(action => action.result === 'success').length;
    const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;

    // Calculate total match minutes
    const minutes = currentMatch.match_actions.map(action => action.minute);
    const totalMinutes = minutes.length > 0 ? Math.max(...minutes) : 0;

    // Group actions by type
    const actionTypes = new Map();
    currentMatch.match_actions.forEach(action => {
      if (!actionTypes.has(action.action_id)) {
        actionTypes.set(action.action_id, {
          total: 0,
          successful: 0
        });
      }
      const stats = actionTypes.get(action.action_id);
      stats.total++;
      if (action.result === 'success') {
        stats.successful++;
      }
    });

    // Compare with goals from pre-match report
    const preMatchActions = currentMatch.pre_match_reports?.actions || [];
    const goalsComparison = preMatchActions.map(preMatchAction => {
      const actionStats = actionTypes.get(preMatchAction.id) || { total: 0, successful: 0 };
      const goalTarget = preMatchAction.goal ? parseInt(preMatchAction.goal) : null;
      
      if (!goalTarget) return null;

      const achievementRate = (actionStats.successful / goalTarget) * 100;
      return {
        actionName: preMatchAction.name,
        achieved: actionStats.successful,
        goal: goalTarget,
        achievementRate
      };
    }).filter(Boolean);

    // Generate insights
    const insights = [];

    // Overall performance insight
    insights.push(`ביצעת ${totalActions} פעולות במהלך ${totalMinutes} דקות משחק, מתוכן ${successfulActions} פעולות מוצלחות (${successRate.toFixed(1)}% הצלחה).`);

    // Actions breakdown
    actionTypes.forEach((stats, actionId) => {
      const action = preMatchActions.find(a => a.id === actionId);
      if (action) {
        const successRate = (stats.successful / stats.total) * 100;
        insights.push(`ב${action.name}: ביצעת ${stats.total} נסיונות, ${stats.successful} מוצלחים (${successRate.toFixed(1)}% הצלחה).`);
      }
    });

    // Goals achievement insights
    goalsComparison.forEach(comparison => {
      if (comparison.achievementRate >= 100) {
        insights.push(`כל הכבוד! עמדת ביעד ${comparison.actionName} (${comparison.achieved}/${comparison.goal}).`);
      } else if (comparison.achievementRate >= 75) {
        insights.push(`התקרבת מאוד ליעד ${comparison.actionName} (${comparison.achieved}/${comparison.goal}).`);
      } else {
        insights.push(`יש מקום לשיפור ב${comparison.actionName} (${comparison.achieved}/${comparison.goal}).`);
      }
    });

    // Add intensity insight based on actions per minute
    const actionsPerMinute = totalMinutes > 0 ? totalActions / totalMinutes : 0;
    if (actionsPerMinute > 0.5) {
      insights.push(`שיחקת במשחק אינטנסיבי עם ממוצע של ${actionsPerMinute.toFixed(2)} פעולות לדקה.`);
    }

    return new Response(
      JSON.stringify({ insights: insights.join('\n\n') }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});