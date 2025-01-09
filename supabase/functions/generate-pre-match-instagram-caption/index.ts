import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { reportId } = await req.json()

    if (!reportId) {
      throw new Error('Report ID is required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch pre-match report data
    const { data: report, error: reportError } = await supabaseClient
      .from('pre_match_reports')
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .eq('id', reportId)
      .single()

    if (reportError) throw reportError

    const havaya = report.havaya ? report.havaya.split(',') : []
    const actions = report.actions || []
    const answers = report.questions_answers || {}

    // Generate caption using GPT-4
    const prompt = `
      Create an engaging Instagram caption in Hebrew for a pre-match report. Use these details:
      - Opponent: ${report.opponent || 'היריבה'}
      - Selected feelings: ${havaya.join(', ')}
      - Game goals: ${actions.map(a => a.name + (a.goal ? ` (${a.goal})` : '')).join(', ')}
      - Player's answers:
      ${Object.entries(answers).map(([q, a]) => `${q}: ${a}`).join('\n')}

      The caption should:
      1. Be enthusiastic and motivational
      2. Include emojis
      3. List the feelings and goals
      4. Include a call to action for followers
      5. Include relevant hashtags in Hebrew
      6. Follow this structure:
      - Opening statement with fire emoji
      - List of feelings with emojis
      - Goals with check mark emojis
      - Personal reflections
      - Why sharing is important (4 numbered points)
      - Closing statement
      - Question for followers
      - Hashtags
    `

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
      }),
    })

    const aiData = await openAIResponse.json()
    const caption = aiData.choices[0].message.content

    return new Response(
      JSON.stringify({ caption }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error generating caption:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})