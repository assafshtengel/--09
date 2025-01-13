import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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
    const { currentDate, currentTime, gameDate, gameTime, commitments, timeRemaining } = await req.json()

    console.log('Received request with params:', { currentDate, currentTime, gameDate, gameTime, commitments, timeRemaining })

    const prompt = `
    אני שחקן כדורגל וצריך סדר יום מפורט מהתאריך ${currentDate} בשעה ${currentTime} ועד למשחק שמתחיל בתאריך ${gameDate} בשעה ${gameTime}.
    הזמן שנותר עד למשחק: ${timeRemaining}
    המחויבויות שלי הן: ${commitments}
    
    אנא צור לי סדר יום מפורט עם שעות מדויקות שיכלול:
    - זמני יציאה מהבית
    - זמני ארוחות מדויקים ומה לאכול בכל ארוחה
    - זמני שינה ומנוחה
    - זמן לפעילויות הכנה למשחק
    - התייחסות למחויבויות שציינתי
    - טיפים להצלחה
    
    חשוב: השעות הן בפורמט של 24 שעות. למשל, 10:00 היא עשר בבוקר ולא עשר בלילה.
    אנא הצג את התשובה בפורמט מסודר עם שעות מדויקות בתחילת כל שורה.
    `

    console.log('Sending request to OpenAI with prompt:', prompt)

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

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    console.log('Received response from OpenAI:', data)

    const schedule = data.choices[0].message.content

    return new Response(
      JSON.stringify({ schedule }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in generate-pre-game-schedule function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})