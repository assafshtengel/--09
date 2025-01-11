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
      currentDateTime,
      gameDateTime,
      schoolHours,
      teamTrainings,
      personalTrainings,
      otherCommitments,
      screenTime,
      sleepHours,
    } = await req.json()

    const prompt = `
    אני שחקן כדורגל וצריך לוח זמנים מפורט מ-${currentDateTime} ועד למשחק ב-${gameDateTime}.

    מידע חשוב:
    - שעות בית ספר: ${schoolHours}
    - אימוני קבוצה: ${teamTrainings}
    - אימונים אישיים: ${personalTrainings}
    - מחויבויות נוספות: ${otherCommitments}
    - זמן מסכים רצוי ביום: ${screenTime} שעות
    - שעות שינה רצויות: ${sleepHours} שעות

    אנא צור לי לוח זמנים מפורט שכולל:
    1. חלוקה לפי ימים ושעות
    2. שיבוץ כל הפעילויות הקבועות
    3. הקצאת זמן שינה קבוע
    4. שיבוץ זמן מסכים באופן מאוזן
    5. זמני ארוחות
    6. זמני מנוחה והתאוששות
    7. הכנה מנטלית למשחק
    8. טיפים להצלחה

    חשוב: הצג את התשובה בפורמט מסודר עם תאריכים ושעות מדויקות.
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
            content: 'אתה מאמן כדורגל מקצועי שעוזר לשחקנים לתכנן את הזמן שלהם לפני משחקים. התשובות שלך תמיד בעברית ומותאמות לשחקן צעיר.'
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