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
    const { schedule } = await req.json()
    
    if (!Deno.env.get('OPENAI_API_KEY')) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    console.log("Received schedule data:", schedule)

    const prompt = `
    אני שחקן כדורגל וצריך לוח זמנים שבועי מפורט.

    מידע חשוב:
    - ימי בית ספר: ${JSON.stringify(schedule.schoolDays)}
    - שעות בית ספר: ${JSON.stringify(schedule.schoolHours)}
    - אימוני קבוצה: ${JSON.stringify(schedule.teamTraining)}
    - אימונים אישיים: ${JSON.stringify(schedule.personalTraining)}
    - שעות שינה רצויות: ${schedule.sleepSchedule?.desiredHours} שעות ו-${schedule.sleepSchedule?.desiredMinutes} דקות
    - זמן מסכים רצוי ביום: ${schedule.screenTime} שעות
    - אירועים מיוחדים: ${JSON.stringify(schedule.specialEvents)}
    - משחקים: ${JSON.stringify(schedule.games)}
    - הערות נוספות: ${schedule.notes || 'אין'}

    אנא צור:
    1. תיאור מילולי מפורט של הלוז השבועי
    2. טבלה שבועית מפורטת עם כל הפעילויות

    חשוב:
    - לשלב את כל הפעילויות בצורה מאוזנת
    - להקצות זמן למנוחה והתאוששות
    - לוודא שיש מספיק זמן שינה
    - לחלק את זמן המסכים באופן מאוזן
    - להתחשב בזמני הכנה למשחקים
    - לשלב זמני ארוחות

    הצג את התשובה בשני חלקים:
    1. תיאור מילולי של הלוז
    2. טבלה שבועית מפורטת
    `

    console.log("Sending request to OpenAI")
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
            content: 'אתה מאמן כושר ומומחה לתכנון זמן שעוזר לספורטאים צעירים לתכנן את הלוז השבועי שלהם. התשובות שלך תמיד בעברית.'
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
      const error = await response.json()
      console.error("OpenAI API error:", error)
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log("Received response from OpenAI")
    const generatedText = data.choices[0].message.content

    // Split the response into schedule and table sections
    const [schedule_text, weeklyTable] = generatedText.split('טבלה שבועית:')

    return new Response(
      JSON.stringify({ 
        schedule: schedule_text.trim(), 
        weeklyTable: weeklyTable ? weeklyTable.trim() : '' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
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