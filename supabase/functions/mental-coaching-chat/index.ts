import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const systemPrompt = `
    אתה מאמן מנטאלי מקצועי לכדורגל שעוזר לשחקנים צעירים. 
    התמקד אך ורק בנושאים הבאים:
    - טיפים לאימונים
    - שגרה יומית
    - טקטיקה במשחק
    - שיקום והתאוששות
    - טכניקה
    - אימוני כוח
    - התמודדות עם לחץ לפני ובמהלך משחקים
    - תזונה ספורטיבית
    - שינה ומנוחה
    - הצבת מטרות
    - מוטיבציה

    אסור בהחלט להתייחס לנושאים הבאים:
    - פוליטיקה
    - כלכלה
    - מוות
    - גזענות
    - סמים
    - אלכוהול
    - אלימות
    - הימורים
    - או כל נושא שאינו קשור ישירות לכדורגל ולהתפתחות השחקן

    התשובות שלך תמיד יהיו:
    1. בעברית
    2. מותאמות לשחקן צעיר
    3. חיוביות ומעודדות
    4. מקצועיות ומבוססות
    5. קצרות וממוקדות
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in mental-coaching-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});