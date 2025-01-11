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

    console.log('Creating Supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching match data for ID:', matchId);
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_report:pre_match_reports!matches_pre_match_report_id_fkey (
          questions_answers,
          havaya,
          actions
        )
      `)
      .eq('id', matchId)
      .maybeSingle();

    if (matchError) {
      console.error('Error fetching match:', matchError);
      throw matchError;
    }

    if (!match) {
      console.error('No match found for ID:', matchId);
      throw new Error('Match not found');
    }

    console.log('Processing match data...');
    const havaya = match.pre_match_report?.havaya ? match.pre_match_report.havaya.split(',') : [];
    const actions = match.pre_match_report?.actions || [];
    const answers = match.pre_match_report?.questions_answers || {};

    console.log('Preparing OpenAI prompt...');
    const prompt = `
      Create an engaging Instagram caption in Hebrew for a pre-match report with these details:
      - Opponent: ${match.opponent || 'היריבה'}
      - Selected feelings: ${havaya.join(', ')}
      - Game goals: ${Array.isArray(actions) ? actions.map((a: any) => a.name + (a.goal ? ` (${a.goal})` : '')).join(', ') : ''}
      - Player's answers: ${Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n')}

      The caption should:
      1. Start with an enthusiastic opening statement
      2. Include relevant emojis
      3. List the feelings and goals
      4. Include a personal message about motivation
      5. Add relevant Hebrew hashtags
      6. Follow this structure:
      
      [פתיחה נלהבת] 🔥
      
      היום אני מתכונן למשחק מול [שם היריבה] ⚽
      
      התחושות שלי:
      [רשימת תחושות עם אימוג'ים]
      
      היעדים שלי למשחק:
      [רשימת יעדים עם אימוג'ים]
      
      [מסר אישי על מוטיבציה]
      
      [האשטגים]
    `;

    console.log('Calling OpenAI API...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a sports social media expert that creates engaging Instagram captions in Hebrew.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      throw new Error('OpenAI API error');
    }

    const aiData = await openAIResponse.json();
    console.log('Received response from OpenAI');
    
    if (!aiData.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', aiData);
      throw new Error('Invalid response from OpenAI');
    }

    const caption = aiData.choices[0].message.content;
    console.log('Successfully generated caption');

    return new Response(
      JSON.stringify({ caption }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error generating caption:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});