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

    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports!matches_pre_match_report_id_fkey (
          questions_answers,
          havaya,
          actions
        )
      `)
      .eq('id', matchId)
      .single();

    if (matchError) throw matchError;

    const havaya = match.pre_match_reports?.havaya?.split(',') || [];
    const actions = match.pre_match_reports?.actions || [];
    const questionsAnswers = match.pre_match_reports?.questions_answers || {};

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
            1. Opening with game context and selected havaya feelings
            2. Main goals and focus areas
            3. Personal commitment and motivation
            4. Closing with positive energy and hashtags
            Use emojis appropriately and maintain an inspirational tone.`
          },
          {
            role: 'user',
            content: `Create an Instagram caption in Hebrew for a pre-match post with the following details:
              - Opponent: ${match.opponent}
              - Selected Havaya: ${havaya.join(', ')}
              - Main Goals: ${actions.map(a => `${a.name} (${a.goal || 'לא הוגדר'})`).join(', ')}
              - Pre-match feelings: ${JSON.stringify(questionsAnswers)}
              
              Follow this structure:
              "לקראת המשחק! 🔥
              
              [פתיחה עם הקשר המשחק והתחושות שנבחרו]
              
              ⚽ היעדים שלי למשחק:
              [פירוט היעדים]
              
              💪 התחושות שלי:
              [תחושות ומוטיבציה]
              
              🎯 המיקוד שלי:
              [נקודות מיקוד ספציפיות]
              
              [סיום עם האשטגים]"`
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