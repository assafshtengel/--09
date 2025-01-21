import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { position, team, skills } = await req.json()

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    const prompt = `
      כתוב טקסט מוטיבציוני קצר בעברית (2-3 משפטים) המתאר את החזון של שחכן כדורגל שרוצה להיות ${position} ב${team}.
      הכישורים שהוא רוצה לפתח: ${skills}.
      הטקסט צריך להיות אישי, מעורר השראה ולכלול אימוג'ים מתאימים.
    `

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "אתה עוזר שכותב טקסטים מוטיבציוניים לשחקני כדורגל צעירים. כתוב בטון חיובי ומעודד."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    })

    const text = completion.data.choices[0].message?.content || ''

    return new Response(
      JSON.stringify({ text }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})