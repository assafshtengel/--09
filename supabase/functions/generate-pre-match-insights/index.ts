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
      insights.push(`התמקד בתחושות ${havaya.join(', ')} שבחרת למשחק זה. אלו התחושות שיובילו אותך להצלחה!`)
    }

    // Helper function to add insights based on answers
    const addInsightIfAnswered = (question: string, answer: string) => {
      if (answer && answer.trim()) {
        switch (question) {
          case "מהי המטרה העיקרית שלך במשחק הקרוב?":
            insights.push(`זכור את המטרה העיקרית שלך למשחק: ${answer}. תן לה להוביל אותך בכל רגע במשחק.`)
            break
          case "מהן שלוש החוזקות שלך כשחקן?":
            insights.push(`החוזקות שלך הן המפתח להצלחה: ${answer}. השתמש בהן!`)
            break
          case "איך אתה מתמודד עם לחץ במהלך משחק?":
            insights.push(`כשתרגיש לחץ במשחק, זכור את הדרך שלך להתמודד: ${answer}`)
            break
          case "באיזה תחום היית רוצה להשתפר משמעותית במשחק הבא?":
            insights.push(`זה המשחק להתמקד בשיפור ${answer}. כל ניסיון הוא צעד קדימה!`)
            break
          case "מה המוטיבציה העיקרית שלך לשחק?":
            insights.push(`המוטיבציה שלך היא ${answer} - תן לה להוביל אותך ולהעניק לך כוח`)
            break
          case "איך אתה מתכונן מנטלית למשחק?":
            insights.push(`ההכנה המנטלית שלך חשובה: ${answer}. המשך עם זה!`)
            break
          case "מה עוזר לך להישאר ממוקד במהלך המשחק?":
            insights.push(`כדי להישאר ממוקד, זכור: ${answer}. זה המפתח להצלחה שלך`)
            break
          case "מה הציפיות שלך מעצמך במשחק הזה?":
            insights.push(`היעד שהצבת לעצמך: ${answer}. אתה יכול להשיג אותו!`)
            break
        }
      }
    }

    // Process each answer and generate relevant insights
    Object.entries(questionsAnswers).forEach(([question, answer]) => {
      addInsightIfAnswered(question, answer as string)
    })

    // Add general pre-game insights and motivational messages in Hebrew
    const generalInsights = [
      "קח נשימה עמוקה והתמקד במה שאתה יודע לעשות הכי טוב",
      "זכור שכל משחק הוא הזדמנות ללמידה והתפתחות",
      "תן לעצמך ליהנות מהמשחק ולהיות נוכח ברגע",
      "התמקד בתהליך ולא רק בתוצאה",
      "אתה מוכן למשחק הזה, סמוך על היכולות שלך",
      "תן את המקסימום שלך ותהיה גאה בעצמך",
      "זכור - אתה כאן כי אתה אוהב את המשחק",
      "אתה חזק מנטלית, תאמין בעצמך",
      "כל החלטה שתקבל במגרש - תעשה אותה בביטחון מלא",
      "תיהנה מכל רגע במשחק, אתה עושה את מה שאתה אוהב"
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