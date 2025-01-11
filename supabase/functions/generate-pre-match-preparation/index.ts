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

    console.log('Match data:', match);

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
            content: `אתה עוזר לשחקן כדורגל צעיר לכתוב טקסט אישי ומעורר השראה לעצמו לפני המשחק.
            הטקסט צריך להיות כתוב בגוף ראשון, כאילו השחקן מדבר עם עצמו.
            
            עליך להתייחס באופן מעמיק ל:
            1. ההוויות שבחרתי - איך הן משקפות את המצב הרגשי שלי
            2. היעדים שהצבתי לעצמי - מה אני רוצה להשיג
            3. התשובות שלי לשאלות - מה אני מרגיש ואיך אני מתכונן
            4. תובנות אישיות - מה אני לומד על עצמי
            
            הנחיות נוספות:
            - כתוב בעברית בטון אישי ומעודד
            - השתמש במשפטים כמו "אני מרגיש...", "אני יודע ש...", "אני מאמין ב..."
            - צור כותרות משנה עם אימוג'ים שמשקפות את המחשבות שלי
            - התייחס לכל המידע שסיפרתי על עצמי
            - הדגש את החוזקות והאמונה העצמית שלי
            - סיים עם משפט חיזוק אישי והאשטגים מעוררי השראה`
          },
          {
            role: 'user',
            content: `צור טקסט הכנה אישי למשחק נגד ${match.opponent}.
            
            ההוויות שבחרתי: ${havaya.join(', ')}
            
            היעדים שהצבתי לעצמי:
            ${JSON.stringify(actions, null, 2)}
            
            התשובות שלי לשאלות:
            ${JSON.stringify(preMatchAnswers, null, 2)}
            
            אנא כתוב את הטקסט בצורה אישית שתכלול:
            1. פתיחה - איך אני מרגיש לקראת המשחק
            2. ההוויות שבחרתי - למה הן משמעותיות עבורי
            3. היעדים שהצבתי - מה אני רוצה להשיג ולמה
            4. התובנות שלי מהתשובות - מה אני לומד על עצמי
            5. נקודות החוזק שלי - במה אני מאמין
            6. משפט סיכום אישי - מה אני אומר לעצמי
            7. האשטגים שמחזקים אותי`
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