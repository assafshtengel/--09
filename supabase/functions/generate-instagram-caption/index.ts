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

    if (!matchId) {
      throw new Error('Match ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch match data and related information
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports (
          questions_answers,
          havaya
        ),
        post_game_feedback (
          performance_ratings,
          questions_answers
        ),
        match_actions (
          action_id,
          result
        )
      `)
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;

    // Calculate success rates
    const actions = match.match_actions || [];
    const totalActions = actions.length;
    const successfulActions = actions.filter((a: any) => a.result === 'success').length;
    const successRate = totalActions > 0 ? ((successfulActions / totalActions) * 100).toFixed(1) : 0;

    // Get pre-match feelings and goals
    const preMatchAnswers = match.pre_match_reports?.questions_answers || {};
    const havaya = match.pre_match_reports?.havaya?.split(',') || [];
    
    // Get post-match feedback
    const performanceRatings = match.post_game_feedback?.performance_ratings || {};
    const postMatchAnswers = match.post_game_feedback?.questions_answers || {};

    // Find strongest and weakest areas based on performance ratings
    const ratings = Object.entries(performanceRatings);
    const strongestSkill = ratings.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    const weakestSkill = ratings.reduce((a, b) => (b[1] < a[1] ? b : a))[0];

    // Generate the caption using GPT-4
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional sports content writer who creates engaging Instagram captions for soccer players. Write in Hebrew, be motivational and authentic.'
          },
          {
            role: 'user',
            content: `Create an Instagram caption for a soccer game with the following details:
              - Opponent: ${match.opponent}
              - Success rate: ${successRate}%
              - Pre-game feelings: ${havaya.join(', ')}
              - Strongest skill: ${strongestSkill}
              - Area to improve: ${weakestSkill}
              
              Format the text with emojis and make it engaging for Instagram. Include relevant hashtags.`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    const caption = aiResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({ caption }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error generating Instagram caption:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});