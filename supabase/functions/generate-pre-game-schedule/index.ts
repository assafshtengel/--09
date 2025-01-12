import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sleepHours, screenTime, schoolHours, teamTraining } = await req.json()
    console.log('Received input:', { sleepHours, screenTime, schoolHours, teamTraining })

    // Validate OpenAI API key
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `
    אני שחקן כדורגל וצריך לוח זמנים יומי מפורט.

    מידע חשוב:
    - שעות שינה: ${sleepHours} שעות
    - זמן מסך: ${screenTime} שעות
    - שעות בית ספר: ${schoolHours ? `${schoolHours.start} עד ${schoolHours.end}` : 'אין בית ספר'}
    - אימון קבוצתי: ${teamTraining || 'אין אימון'}

    אנא צור לי לוח זמנים מפורט שכולל:
    1. זמני ארוחות מסודרים
    2. זמני מנוחה והתאוששות
    3. זמן למתיחות
    4. זמן חופשי
    5. הכנה מנטלית
    6. זמן מסכים מחולק נכון
    7. טיפים להצלחה

    חשוב: הצג את התשובה בפורמט מסודר עם שעות מדויקות.
    `

    console.log('Sending request to OpenAI')
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4', // Fixed model name
        messages: [
          {
            role: 'system',
            content: 'אתה מאמן כדורגל מקצועי שעוזר לשחקנים לתכנן את הזמן שלהם. התשובות שלך תמיד בעברית ומותאמות לשחקן צעיר.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Received response from OpenAI')

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI')
    }

    const schedule = data.choices[0].message.content

    return new Response(
      JSON.stringify({ schedule }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in generate-pre-game-schedule:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      },
    )
  }
})