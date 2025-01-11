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

    // Fetch match data including pre-match report
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
    const answers = match?.pre_match_reports?.questions_answers || {};

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
            content: `אתה עוזר לשחקן כדורגל צעיר לכתוב פוסט מעורר השראה על ההכנה שלו למשחק.
            הפוסט צריך להיות כתוב בעברית, בטון חיובי ומעודד, ולכלול אימוג'ים מתאימים.
            התייחס לכל המידע שהשחקן סיפק: ההוויות שבחר, היעדים שהציב לעצמו, והתשובות שנתן לשאלות.`
          },
          {
            role: 'user',
            content: `צור פוסט מעורר השראה עבור שחקן שמתכונן למשחק נגד ${match.opponent}.
            ההוויות שבחר: ${havaya.join(', ')}
            היעדים שהציב: ${JSON.stringify(actions)}
            תשובות נוספות: ${JSON.stringify(answers)}
            
            הפוסט צריך לכלול:
            1. פתיחה מעוררת מוטיבציה
            2. התייחסות להוויות שנבחרו
            3. פירוט היעדים למשחק
            4. התייחסות לתשובות הנוספות
            5. סיום מעורר השראה
            6. האשטגים רלוונטיים
            
            השתמש באימוג'ים מתאימים לאורך הטקסט.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
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