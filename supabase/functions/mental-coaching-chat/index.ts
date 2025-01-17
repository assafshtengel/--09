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
    const { messages, chatType } = await req.json()

    let systemMessage = 'אתה מאמן מנטלי מקצועי שעוזר לשחקני כדורגל צעירים. התשובות שלך תמיד בעברית.'

    if (chatType === 'pre_match') {
      systemMessage = 'אתה מאמן מנטלי שעוזר לשחקנים להתכונן למשחק. התשובות שלך תמיד בעברית ומכוונות להכנה מנטלית למשחק.'
    } else if (chatType === 'post_match') {
      systemMessage = 'אתה מאמן מנטלי שעוזר לשחקנים לנתח את המשחק שלהם. התשובות שלך תמיד בעברית ומכוונות לניתוח והפקת לקחים.'
    }

    console.log('Sending request to OpenAI with messages:', messages)

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
          ...messages
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
      JSON.stringify({ message: data.choices[0].message.content }),
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