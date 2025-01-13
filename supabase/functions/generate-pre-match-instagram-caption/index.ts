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

    if (!reportId) {
      throw new Error('Report ID is required');
    }

    console.log('Creating Supabase client...');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching report data for ID:', reportId);
    const { data: report, error: reportError } = await supabaseClient
      .from('pre_match_reports')
      .select(`
        *,
        profiles (
          full_name
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

    console.log('Processing report data...');
    const havaya = report.havaya ? report.havaya.split(',') : [];
    const actions = report.actions || [];
    const answers = report.questions_answers || {};

    console.log('Preparing OpenAI prompt...');
    const prompt = `
      Create an engaging Instagram caption in Hebrew starting with "${title || 'ההכנה שלי למשחק'}" with these details:
      - Player: ${report.profiles?.full_name || 'שחקן'}
      - Opponent: ${report.opponent || 'היריבה'}
      - Match Type: ${report.match_type || 'ידידות'}
      - Selected feelings: ${havaya.join(', ')}
      - Game goals: ${actions.map((a: any) => a.name + (a.goal ? ` (${a.goal})` : '')).join(', ')}
      - Player's answers: ${Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n')}

      The caption should:
      1. Start with the title
      2. Include relevant emojis
      3. List the feelings and goals
      4. Include a personal message about motivation
      5. Add relevant Hebrew hashtags
      6. Follow this structure:
      
      [${title}] 🔥
      
      היום אני מתכונן למשחק [סוג המשחק] מול [שם היריבה] ⚽
      
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
