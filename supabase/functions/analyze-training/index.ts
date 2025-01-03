import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { ratings, answers } = await req.json()
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "אתה מאמן כדורגל מקצועי שמנתח ביצועי אימון ונותן המלצות לשיפור. התשובות שלך צריכות להיות תמיד בעברית."
          },
          {
            role: "user",
            content: `נתח את הביצועים הבאים ותן 3 המלצות ספציפיות לשיפור:
            
            דירוגים:
            ${Object.entries(ratings).map(([key, value]) => `${key}: ${value}`).join('\n')}
            
            תשובות לשאלות:
            ${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    })

    const data = await openAIResponse.json()
    const insights = data.choices[0].message.content

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})