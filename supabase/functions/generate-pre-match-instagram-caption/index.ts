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
    const { reportId, title } = await req.json();
    console.log('Starting caption generation for report:', reportId);

    if (!reportId) {
      throw new Error('Report ID is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching report data...');
    const { data: report, error: reportError } = await supabaseClient
      .from('pre_match_reports')
      .select(`
        *,
        profiles (
          full_name,
          club,
          team_year
        )
      `)
      .eq('id', reportId)
      .maybeSingle();

    if (reportError) {
      console.error('Error fetching report:', reportError);
      throw reportError;
    }

    if (!report) {
      console.error('No report found for ID:', reportId);
      throw new Error('Report not found');
    }

    console.log('Processing report data for comprehensive summary...');
    const havaya = report.havaya ? report.havaya.split(',') : [];
    const actions = report.actions || [];
    const answers = report.questions_answers || {};
    const playerName = report.profiles?.full_name || 'שחקן';
    const club = report.profiles?.club || '';
    const teamYear = report.profiles?.team_year || '';

    console.log('Preparing OpenAI prompt for comprehensive summary...');
    const prompt = `
      Create an engaging, motivational Instagram caption in Hebrew that includes:
      
      Context:
      - Player: ${playerName}${club ? ` from ${club}` : ''}${teamYear ? ` (${teamYear})` : ''}
      - Match: ${report.match_type || 'ידידות'} against ${report.opponent || 'היריבה'}
      - Selected feelings: ${havaya.join(', ')}
      - Game goals: ${actions.map((a: any) => `${a.name}${a.goal ? ` (${a.goal})` : ''}`).join(', ')}
      - Player's answers: ${Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n')}

      Requirements:
      1. Start with "ההכנה שלי למשחק 🔥"
      2. Include a personal, motivational message based on their goals and feelings
      3. Highlight their preparation and mindset
      4. Add encouraging words about their selected goals
      5. Include relevant emojis throughout
      6. End with relevant Hebrew hashtags
      7. Keep the tone positive and energetic
      8. Make it personal and specific to their answers
      9. Maximum length: 2000 characters
      10. Structure the text in clear sections with line breaks

      Make it feel like a personal, motivational message that will inspire both the player and their followers.
    `;

    console.log('Calling OpenAI API for caption generation...');
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
            content: 'You are a professional sports motivator and social media expert that creates engaging, personal, and motivational Instagram captions in Hebrew. Focus on creating content that inspires and motivates both the athlete and their followers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const aiData = await openAIResponse.json();
    console.log('Successfully generated caption');
    
    if (!aiData.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response:', aiData);
      throw new Error('Invalid response from OpenAI');
    }

    const caption = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ caption }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Error generating caption:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString(),
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});