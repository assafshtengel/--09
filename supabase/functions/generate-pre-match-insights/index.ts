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
          questions_answers
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
    const insights: string[] = []

    // Helper function to add insights based on answers
    const addInsightIfAnswered = (question: string, answer: string) => {
      if (answer && answer.trim()) {
        switch (question) {
          case "מהי המטרה העיקרית שלך במשחק הקרוב?":
            insights.push(`זכור את המטרה העיקרית שלך: ${answer}`)
            break
          case "מהן שלוש החוזקות שלך כשחקן?":
            insights.push(`התמקד בחוזקות שלך: ${answer}`)
            break
          case "איך אתה מתמודד עם לחץ במהלך משחק?":
            insights.push(`השתמש באסטרטגיית ההתמודדות שלך עם לחץ: ${answer}`)
            break
          case "באיזה תחום היית רוצה להשתפר משמעותית במשחק הבא?":
            insights.push(`זו הזדמנות טובה להתמקד בשיפור ${answer}`)
            break
          case "מה המוטיבציה העיקרית שלך לשחק?":
            insights.push(`זכור מה מניע אותך: ${answer}`)
            break
        }
      }
    }

    // Process each answer and generate relevant insights
    Object.entries(questionsAnswers).forEach(([question, answer]) => {
      addInsightIfAnswered(question, answer as string)
    })

    // Add some general pre-game insights if we don't have enough from the answers
    if (insights.length < 3) {
      insights.push(
        "קח נשימה עמוקה והתמקד במה שאתה יודע לעשות הכי טוב",
        "זכור שכל משחק הוא הזדמנות ללמידה והתפתחות",
        "תן לעצמך להנות מהמשחק ולהיות נוכח ברגע"
      )
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