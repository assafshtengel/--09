import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { trainingData } = await req.json();

    const prompt = `
    בתור מאמן כדורגל מקצועי, נתח את סיכום האימון הבא ותן תובנות מפורטות ומשמעותיות לשחקן:

    ${JSON.stringify(trainingData, null, 2)}

    אנא התייחס ל:
    1. נקודות חוזק וחולשה באימון
    2. המלצות לשיפור
    3. דגשים למשחק הבא
    4. טיפים מנטליים

    התשובה צריכה להיות בעברית, ידידותית ומעודדת.
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
            content: 'אתה מאמן כדורגל מקצועי שעוזר לשחקנים להשתפר. התשובות שלך תמיד בעברית ומותאמות לשחקן צעיר.'
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
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate insights');
    }

    const data = await response.json();
    console.log('Received response from OpenAI:', data)

    return new Response(
      JSON.stringify({ insights: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in generate-training-insights function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})