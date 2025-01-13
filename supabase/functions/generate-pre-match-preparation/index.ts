import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { matchId } = await req.json();

    if (!matchId) {
      throw new Error('Match ID is required');
    }

    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports (
          questions_answers,
          havaya,
          actions
        )
      `)
      .eq('id', matchId)
      .single();

    if (matchError) {
      throw matchError;
    }

    const havaya = match?.pre_match_reports?.havaya?.split(',') || [];
    const actions = match?.pre_match_reports?.actions || [];
    const preMatchAnswers = match?.pre_match_reports?.questions_answers || {};

    // Generate the preparation text using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `אתה עוזר לשחקן כדורגל צעיר לכתוב טקסט אישי ומעורר השראה להכנה למשחק.
            הטקסט צריך להיות מפורט ומדויק, ולהתייחס לכל המידע שהשחקן סיפק.
            
            עליך להתייחס באופן מעמיק ל:
            1. לוח הזמנים המדויק של היום - שעות קימה, ארוחות, נסיעות
            2. ההוויות שנבחרו - איך הן משקפות את המצב הרגשי
            3. היעדים למשחק - מה השחקן רוצה להשיג
            4. התשובות לשאלות - מה השחקן מרגיש ואיך הוא מתכונן
            5. המלצות ספציפיות לגבי:
               - תזונה לפני המשחק
               - חימום והכנה גופנית
               - הכנה מנטלית
               - ניהול אנרגיה ומנוחה
            
            הנחיות נוספות:
            - כתוב בעברית בטון אישי ומעודד
            - חלק את הטקסט לסעיפים ברורים עם כותרות
            - הוסף אימוג'ים מתאימים לכל סעיף
            - התייחס לכל פרט שהשחקן סיפק
            - סיים עם משפטי חיזוק והאשטגים מעוררי השראה`
          },
          {
            role: 'user',
            content: `צור טקסט הכנה אישי למשחק נגד ${match.opponent}.
            
            ההוויות שנבחרו: ${havaya.join(', ')}
            
            היעדים למשחק:
            ${JSON.stringify(actions, null, 2)}
            
            התשובות לשאלות:
            ${JSON.stringify(preMatchAnswers, null, 2)}
            
            אנא כתוב טקסט מפורט שיכלול:
            1. לוח זמנים מדויק ליום המשחק
            2. הסבר על משמעות ההוויות שנבחרו
            3. פירוט היעדים והדרך להשגתם
            4. המלצות מעשיות להכנה
            5. משפטי חיזוק אישיים
            6. האשטגים מעוררי השראה`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const preparation = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ preparation }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error generating preparation text:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});