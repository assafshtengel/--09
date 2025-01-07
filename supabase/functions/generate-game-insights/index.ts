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

    // Fetch current match data
    const { data: currentMatch, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        match_actions (
          action_id,
          result
        ),
        match_notes (
          note
        ),
        player_id
      `)
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;

    // Fetch previous matches data
    const { data: previousMatches, error: prevMatchesError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        match_actions (
          action_id,
          result
        )
      `)
      .eq('player_id', currentMatch.player_id)
      .neq('id', matchId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (prevMatchesError) throw prevMatchesError;

    // Calculate success rates
    const currentSuccessRate = calculateSuccessRate(currentMatch.match_actions);
    const previousSuccessRates = previousMatches.map(match => ({
      matchId: match.id,
      rate: calculateSuccessRate(match.match_actions)
    }));

    const avgPreviousRate = previousSuccessRates.reduce((acc, curr) => acc + curr.rate, 0) / previousSuccessRates.length;

    // Generate insights
    const insights = [];

    // Compare with previous matches
    if (currentSuccessRate > avgPreviousRate) {
      insights.push(`שיפור משמעותי! אחוז ההצלחה שלך במשחק זה (${currentSuccessRate.toFixed(1)}%) גבוה מהממוצע הקודם שלך (${avgPreviousRate.toFixed(1)}%).`);
    } else if (currentSuccessRate < avgPreviousRate) {
      insights.push(`במשחק זה השגת אחוז הצלחה של ${currentSuccessRate.toFixed(1)}%, נמוך מהממוצע הקודם שלך (${avgPreviousRate.toFixed(1)}%). זה יכול להיות הזדמנות טובה ללמידה.`);
    }

    // Analyze notes patterns
    const notes = currentMatch.match_notes;
    if (notes && notes.length > 0) {
      const notesText = notes.map(n => n.note).join(' ');
      if (notesText.includes('לחץ') || notesText.includes('מתח')) {
        insights.push('שים לב שרשמת מספר הערות הקשורות ללחץ ומתח. כדאי לשקול לעבוד על טכניקות רגיעה לפני המשחק הבא.');
      }
      if (notesText.includes('טוב') || notesText.includes('מצוין')) {
        insights.push('ניכר מההערות שלך שהיו רגעים טובים במשחק. חשוב לזכור ולשחזר את התחושות האלו במשחקים הבאים.');
      }
    }

    // Add general insights based on performance
    if (currentSuccessRate >= 75) {
      insights.push('ביצוע מצוין! שמור על רמת הביצועים הגבוהה הזו.');
    } else if (currentSuccessRate >= 50) {
      insights.push('ביצוע טוב, יש מקום לשיפור בדיוק הביצוע.');
    } else {
      insights.push('כדאי להתמקד בשיפור הדיוק והביצוע של הפעולות במשחקים הבאים.');
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

function calculateSuccessRate(actions: any[]) {
  if (!actions || actions.length === 0) return 0;
  const successfulActions = actions.filter(a => a.result === 'success').length;
  return (successfulActions / actions.length) * 100;
}