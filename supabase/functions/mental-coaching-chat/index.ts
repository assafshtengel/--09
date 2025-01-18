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
    const { message, chatType } = await req.json()

    let systemMessage = 'אתה מאמן מנטלי מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'

    if (chatType === 'nutrition') {
      systemMessage = 'אתה יועץ תזונה מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    } else if (chatType === 'strength') {
      systemMessage = 'אתה מאמן כוח מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    } else if (chatType === 'health') {
      systemMessage = 'אתה יועץ בריאות מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    } else if (chatType === 'fitness') {
      systemMessage = 'אתה מאמן חדר כושר מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    } else if (chatType === 'physical') {
      systemMessage = 'אתה מאמן כושר גופני מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    } else if (chatType === 'technical') {
      systemMessage = 'אתה מאמן טכני מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    } else if (chatType === 'tactical') {
      systemMessage = 'אתה מאמן טקטי מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    } else if (chatType === 'sleep') {
      systemMessage = 'אתה יועץ שינה מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    } else if (chatType === 'motivation') {
      systemMessage = 'אתה מאמן מוטיבציה מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'
    }

    console.log('Sending request to OpenAI with message:', message)

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
            content: systemMessage
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${response.status} ${error}`)
    }

    const data = await response.json()
    console.log('Received response from OpenAI:', data)

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error in mental-coaching-chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})