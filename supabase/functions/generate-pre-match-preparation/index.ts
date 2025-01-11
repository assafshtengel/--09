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

    // Fetch match data including pre-match report and post-game feedback
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports (
          questions_answers,
          havaya,
          actions
        ),
        post_game_feedback (
          questions_answers,
          performance_ratings
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
            content: `אתה עוזר לשחקן כדורגל צעיר לכתוב טקסט מעורר השראה על ההכנה שלו למשחק.
            הטקסט צריך להיות מחולק לחלקים ברורים עם כותרות משנה ואימוג'ים מתאימים.
            
            עליך להתייחס באופן מעמיק ל:
            1. ההוויות שנבחרו
            2. היעדים למשחק
            3. התשובות לשאלות הפתוחות - חשוב מאוד להתייחס לכל תשובה!
            4. תובנות אישיות המבוססות על התשובות
            
            הנחיות נוספות:
            - כתוב בעברית בטון חיובי ומעודד
            - השתמש באימוג'ים מתאימים לכל נושא
            - צור כותרות משנה עם אימוג'ים
            - התייחס לכל המידע שהשחקן סיפק
            - הדגש את החוזקות והמוטיבציה של השחקן
            - סיים עם משפט מעורר השראה והאשטגים מתאימים`
          },
          {
            role: 'user',
            content: `צור טקסט הכנה מעורר השראה למשחק נגד ${match.opponent}.
            
            ההוויות שנבחרו: ${havaya.join(', ')}
            
            היעדים למשחק:
            ${JSON.stringify(actions, null, 2)}
            
            תשובות לשאלות פתוחות:
            ${JSON.stringify(preMatchAnswers, null, 2)}
            
            אנא התייחס לכל הנקודות הבאות:
            1. פתיחה מעוררת מוטיבציה
            2. התייחסות מפורטת להוויות שנבחרו
            3. פירוט היעדים למשחק
            4. ניתוח מעמיק של התשובות לשאלות הפתוחות
            5. תובנות אישיות המבוססות על התשובות
            6. סיכום מעורר השראה
            7. האשטגים רלוונטיים`
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