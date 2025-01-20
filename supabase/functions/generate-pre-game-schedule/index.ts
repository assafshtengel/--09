import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const getMealPlan = (gameHour: number) => {
  // Convert game hour to number for comparison
  const gameTime = parseInt(gameHour.toString());
  
  if (gameTime >= 17) {
    return `
    07:00 - ארוחת בוקר: דייסת קוואקר עם חלב/משקה שקדים + פירות חתוכים, או חביתה עם ירקות ולחם מלא
    10:00 - חטיף בוקר: פרי (בננה/תפוח) + חופן אגוזים/שקדים
    13:00 - ארוחת צהריים: פסטה עם רוטב עגבניות ונתחי עוף/הודו/טונה, לצד ירקות
    15:30 - חטיף לפני המשחק: בננה או תמרים, או חטיף אנרגיה
    ${gameTime}:00 - משחק
    ${gameTime + 2}:00 - ארוחת התאוששות: שייק חלבון עם פירות או ארוחה עשירה בחלבון ופחמימות
    `;
  } else if (gameTime >= 13 && gameTime < 17) {
    return `
    07:00 - ארוחת בוקר: דייסת קוואקר עם חלב/משקה סויה/שקדים, תוספת פירות ואגוזים
    10:00 - ארוחה עיקרית: פסטה עם רוטב עגבניות קל + עוף/טונה
    ${gameTime - 1}:30 - חטיף קל: פרי (בננה/תמרים) או חטיף אנרגיה
    ${gameTime}:00 - משחק
    ${gameTime + 2}:00 - ארוחת התאוששות: כריך מלחם מלא עם חזה עוף/גבינה לבנה/טונה + ירקות
    `;
  } else {
    return `
    ${gameTime - 4}:00 - ארוחת בוקר מוקדמת: דייסת קוואקר עם חלב/משקה סויה/שקדים + פרי
    ${gameTime - 2}:00 - חטיף קל: פרי (בננה/תפוח/תמרים) + חופן אגוזים/שקדים
    ${gameTime}:00 - משחק
    ${gameTime + 2}:00 - ארוחת התאוששות: שייק חלבון או כריך מלא עם חלבון
    ${gameTime + 4}:00 - ארוחת צהריים מלאה: אורז/פסטה + חזה עוף/דג, סלט ירקות
    `;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { currentDate, currentTime, gameDate, gameTime, commitments, timeRemaining } = await req.json()

    console.log('Received request with params:', { currentDate, currentTime, gameDate, gameTime, commitments, timeRemaining })

    const gameHour = parseInt(gameTime.split(':')[0]);
    const mealPlan = getMealPlan(gameHour);

    const prompt = `
    אני שחקן כדורגל וצריך סדר יום מפורט מהתאריך ${currentDate} בשעה ${currentTime} ועד למשחק שמתחיל בתאריך ${gameDate} בשעה ${gameTime}.
    הזמן שנותר עד למשחק: ${timeRemaining}
    המחויבויות שלי הן: ${commitments}
    
    תוכנית הארוחות המומלצת:
    ${mealPlan}
    
    אנא צור לי סדר יום מפורט עם הדגשים הבאים:
    1. תכנון של 9 שעות שינה בכל לילה
    2. הגעה למגרש שעה וחצי לפני תחילת המשחק
    3. זמני ארוחות מדויקים לפי התוכנית שצוינה למעלה
    4. זמן מוגדר למתיחות וחימום
    5. זמן לקריאת דוח טרום משחק והכנה מנטלית
    6. הגבלת זמן מסכים (טלפון, טלוויזיה, מחשב)
    7. התייחסות למחויבויות שציינתי
    
    חשוב:
    - השעות הן בפורמט של 24 שעות (למשל, 10:00 היא עשר בבוקר)
    - יש לכלול את כל הארוחות לפי התוכנית שצוינה
    - יש להקפיד על זמני מנוחה בין פעילויות
    
    אנא הצג את התשובה בפורמט הבא:
    [שעה] - [פעילות/ארוחה + פירוט]
    `

    console.log('Sending request to OpenAI with prompt:', prompt)

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