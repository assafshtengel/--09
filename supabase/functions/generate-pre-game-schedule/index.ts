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
    const { currentTime, gameTime, commitments } = await req.json()

    const prompt = `
    אני שחקן כדורגל וצריך סדר יום מפורט מהשעה ${currentTime} ועד למשחק שמתחיל בשעה ${gameTime}.
    המחויבויות שלי הן: ${commitments}
    
    אנא צור לי סדר יום מפורט עם שעות מדויקות שיכלול:
    - חצי שעה למילוי דוח טרום משחק
    - שעתיים וחצי של זמן חופשי למשחקי מחשב/פלאפון/חברים
    - זמני ארוחות ומה לאכול
    - זמני מנוחה
    - פעילויות הכנה למשחק
    - זמני שינה
    - טיפים להצלחה
    
    חשוב לשלב את הזמן החופשי והדוח טרום משחק בצורה מאוזנת שלא תפגע בהכנה למשחק.
    אנא הצג את התשובה בפורמט מסודר עם שעות מדויקות.
    `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'אתה מאמן כדורגל מקצועי שעוזר לשחקנים להתכונן למשחקים. התשובות שלך תמיד בעברית ומותאמות לשחקן צעיר.'
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