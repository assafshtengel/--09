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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { trainingData } = await req.json();

    const prompt = `
    בתור מאמן כדורגל מקצועי, נתח את סיכום האימון הבא ותן תובנות מפורטות ומשמעותיות לשחקן:

    רמת שביעות רצון: ${trainingData.satisfactionRating}/7
    התמודדות עם אתגרים: ${trainingData.challengeHandlingRating}/7
    רמת אנרגיה וריכוז: ${trainingData.energyFocusRating}/7

    תשובות לשאלות:
    ${Object.entries(trainingData.answers)
      .map(([question, answer]) => `${question}: ${answer}`)
      .join('\n')}

    אנא ספק:
    1. ניתוח מפורט של הביצועים
    2. נקודות חוזק ספציפיות שבאו לידי ביטוי
    3. תחומים לשיפור
    4. המלצות קונקרטיות להתקדמות
    5. מסר מוטיבציוני מותאם אישית

    חשוב: התייחס לכל הפרטים שהשחקן סיפק והתאם את התשובה באופן אישי.
    `;

    console.log('Sending request to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'אתה מאמן כדורגל מקצועי שמספק תובנות מעמיקות ומפורטות על אימונים. התשובות שלך תמיד חיוביות, בונות ומעודדות, אך גם כנות ומקצועיות.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to generate insights');
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    console.log('Successfully generated insights');

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating training insights:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while generating insights'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});