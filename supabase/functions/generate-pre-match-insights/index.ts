import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { matchId } = await req.json()

    if (!matchId) {
      throw new Error('Match ID is required')
    }

    // Fetch match data including pre-match report
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports (
          questions_answers,
          havaya
        )
      `)
      .eq('id', matchId)
      .single()

    if (matchError) {
      throw matchError
    }

    console.log('Match data:', match)

    // Generate insights based on the pre-match questionnaire answers
    const questionsAnswers = match?.pre_match_reports?.questions_answers || []
    const havaya = match?.pre_match_reports?.havaya?.split(',') || []
    const insights: string[] = []

    // Add insights based on havaya if available
    if (havaya.length > 0) {
      insights.push(`התמקד בתחושות ${havaya.join(', ')} שבחרת למשחק זה`)
    }

    // Helper function to add insights based on answers
    const addInsightIfAnswered = (question: string, answer: string) => {
      if (answer && answer.trim()) {
        switch (question) {
          case "מהי המטרה העיקרית שלך במשחק הקרוב?":
            insights.push(`זכור את המטרה העיקרית שלך למשחק: ${answer}`)
            break
          case "מהן שלוש החוזקות שלך כשחקן?":
            insights.push(`נצל את החוזקות שלך: ${answer}`)
            break
          case "איך אתה מתמודד עם לחץ במהלך משחק?":
            insights.push(`כשתרגיש לחץ במשחק, זכור: ${answer}`)
            break
          case "באיזה תחום היית רוצה להשתפר משמעותית במשחק הבא?":
            insights.push(`זה המשחק להתמקד בשיפור ${answer}`)
            break
          case "מה המוטיבציה העיקרית שלך לשחק?":
            insights.push(`המוטיבציה שלך היא ${answer} - תן לה להוביל אותך`)
            break
          case "איך אתה מתכונן מנטלית למשחק?":
            insights.push(`הכנה מנטלית: ${answer}`)
            break
          case "מה עוזר לך להישאר ממוקד במהלך המשחק?":
            insights.push(`כדי להישאר ממוקד, זכור: ${answer}`)
            break
          case "מה הציפיות שלך מעצמך במשחק הזה?":
            insights.push(`הצבת לעצמך יעד: ${answer}`)
            break
        }
      }
    }

    // Process each answer and generate relevant insights
    Object.entries(questionsAnswers).forEach(([question, answer]) => {
      addInsightIfAnswered(question, answer as string)
    })

    // Add general pre-game insights and motivational messages
    const generalInsights = [
      "קח נשימה עמוקה והתמקד במה שאתה יודע לעשות הכי טוב",
      "זכור שכל משחק הוא הזדמנות ללמידה והתפתחות",
      "תן לעצמך להנות מהמשחק ולהיות נוכח ברגע",
      "התמקד בתהליך ולא רק בתוצאה",
      "אתה מוכן למשחק הזה, סמוך על היכולות שלך",
      "תן את המקסימום שלך ותהיה גאה בעצמך",
      "זכור - אתה כאן כי אתה אוהב את המשחק"
    ]

    // Add general insights if we don't have enough from the answers
    while (insights.length < 5) {
      const randomInsight = generalInsights[Math.floor(Math.random() * generalInsights.length)]
      if (!insights.includes(randomInsight)) {
        insights.push(randomInsight)
      }
    }

    console.log('Generated insights:', insights)

    return new Response(
      JSON.stringify({ 
        insights: insights.join('\n\n')
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating insights:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})