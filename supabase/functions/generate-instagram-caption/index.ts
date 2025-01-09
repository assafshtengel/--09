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

    console.log('Generating caption for match:', matchId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Use maybeSingle() instead of single() to handle cases where no row is found
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports!matches_pre_match_report_id_fkey (
          questions_answers,
          havaya,
          actions
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
      .maybeSingle();

    if (matchError) {
      console.error('Error fetching match data:', matchError);
      throw matchError;
    }

    if (!match) {
      console.error('No match found with ID:', matchId);
      throw new Error('Match not found');
    }

    // Calculate success rates
    const actions = match.match_actions || [];
    const totalActions = actions.length;
    const successfulActions = actions.filter((a: any) => a.result === 'success').length;
    const successRate = totalActions > 0 ? ((successfulActions / totalActions) * 100).toFixed(1) : 0;

    // Get pre-match feelings and post-match feedback
    const preMatchAnswers = match.pre_match_reports?.questions_answers || {};
    const havaya = match.pre_match_reports?.havaya?.split(',') || [];
    const performanceRatings = match.post_game_feedback?.performance_ratings || {};
    const postMatchAnswers = match.post_game_feedback?.questions_answers || {};

    // Find strongest and weakest areas
    const ratings = Object.entries(performanceRatings);
    const strongestSkill = ratings.length > 0 ? ratings.reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0])[0] : '';
    const weakestSkill = ratings.length > 0 ? ratings.reduce((a, b) => (b[1] < a[1] ? b : a), ['', 5])[0] : '';

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
            content: `You are a professional sports content writer who creates engaging Instagram captions for soccer players in Hebrew. 
            Write motivational and authentic content that follows this structure:
            1. Introduction with game context and pre-game feelings
            2. Performance highlights with specific statistics
            3. Personal feelings about strengths and areas for improvement
            4. Conclusion with lessons learned and next goals
            5. Closing with hashtags
            Use emojis appropriately and maintain an inspirational tone.`
          },
          {
            role: 'user',
            content: `Create an Instagram caption in Hebrew for a soccer game with the following details:
              - Opponent: ${match.opponent}
              - Total Actions: ${totalActions}
              - Success rate: ${successRate}%
              - Pre-game feelings: ${havaya.join(', ')}
              - Strongest skill: ${strongestSkill}
              - Area to improve: ${weakestSkill}
              - Post-game feelings: ${JSON.stringify(postMatchAnswers)}
              
              Follow this structure:
              "סיכום המשחק שלי! 🔥
              
              [פתיחה עם הקשר המשחק ותחושות לפני]
              
              ⚽ מה עשיתי במגרש?
              [סטטיסטיקות וביצועים]
              
              🙌 איך הרגשתי מבחינת יכולת אישית?
              [תחושות על חוזקות ונקודות לשיפור]
              
              💡 המסקנה שלי:
              [לקחים ומסקנות]
              
              🏆 היעד הבא:
              [יעד ספציפי לשיפור]
              
              [סיום עם תודות והאשטגים]"`
          }
        ],
      }),
    });

    const data = await response.json();
    const caption = data.choices[0].message.content;

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