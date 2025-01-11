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
    const {
      sleepHours,
      screenTime,
      schoolHours,
      teamTraining,
    } = await req.json()

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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

    const data = await response.json()
    const schedule = data.choices[0].message.content

    return new Response(
      JSON.stringify({ schedule }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})