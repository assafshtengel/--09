import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get match data and pre-match report
    const { data: match } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports (
          questions_answers
        )
      `)
      .eq('id', matchId)
      .single();

    if (!match?.pre_match_reports?.questions_answers) {
      throw new Error('No pre-match report found');
    }

    // Get previous matches data for additional context
    const { data: previousMatches } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports (
          questions_answers
        )
      `)
      .eq('player_id', match.player_id)
      .order('match_date', { ascending: false })
      .limit(3);

    // Prepare context from previous matches
    const previousMatchesContext = previousMatches
      ?.filter(m => m.pre_match_reports?.questions_answers)
      .map(m => ({
        date: m.match_date,
        answers: m.pre_match_reports.questions_answers
      }));

    // Generate prompt for OpenAI
    const prompt = `
      As a mental sports coach, analyze these pre-match questionnaire answers and provide 2-3 key insights or reminders for the player.
      Focus on mental preparation and previous successful strategies.
      
      Current pre-match answers:
      ${JSON.stringify(match.pre_match_reports.questions_answers, null, 2)}
      
      Previous matches context:
      ${JSON.stringify(previousMatchesContext, null, 2)}
      
      Please provide the insights in Hebrew, focusing on positive reinforcement and actionable reminders.
      Keep each insight concise (1-2 sentences).
      Format the response as a bullet-point list.
    `;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a professional mental sports coach.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const aiData = await openAIResponse.json();
    const insights = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});