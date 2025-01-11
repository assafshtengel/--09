import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const coachTypes = {
  mental: "מאמן מנטאלי",
  nutrition: "מאמן תזונה",
  fitness: "מאמן כושר",
  tactical: "מאמן טקטי",
  technical: "מאמן טכני",
  strength: "מאמן כוח"
};

const getInitialQuestion = (coachType: keyof typeof coachTypes) => {
  const questions = {
    mental: "שלום, אני המאמן המנטאלי שלך. איך אני יכול לעזור לך היום?",
    nutrition: "היי, אני מאמן התזונה שלך. איך אני יכול לעזור לך לשפר את התזונה שלך?",
    fitness: "שלום, אני מאמן הכושר שלך. במה תרצה להתמקד היום?",
    tactical: "היי, אני המאמן הטקטי שלך. איך אני יכול לעזור לך להבין טוב יותר את המשחק?",
    technical: "שלום, אני המאמן הטכני שלך. על איזה אספקט טכני תרצה לעבוד?",
    strength: "היי, אני מאמן הכוח שלך. איך אני יכול לעזור לך להתחזק?"
  };
  return questions[coachType];
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, coachType } = await req.json();

    const systemPrompt = `
    אתה ${coachTypes[coachType]} מקצועי לכדורגל שעוזר לשחקנים צעירים.
    התמקד אך ורק בנושאים הבאים:
    ${coachType === 'mental' ? `
    - טיפים לאימונים
    - שגרה יומית
    - טקטיקה במשחק
    - שיקום והתאוששות
    - התמודדות עם לחץ
    - מוטיבציה` : ''}
    ${coachType === 'nutrition' ? `
    - תזונה ספורטיבית
    - תזונה לפני ואחרי אימון
    - תזונה לפני משחק
    - תוספי תזונה מותרים
    - הידרציה` : ''}
    ${coachType === 'fitness' ? `
    - אימוני סיבולת
    - אימוני מהירות
    - אימוני זריזות
    - חימום נכון
    - שיפור יכולת אירובית` : ''}
    ${coachType === 'tactical' ? `
    - הבנת המשחק
    - מיקום במגרש
    - קריאת משחק
    - אסטרטגיות משחק
    - עבודת צוות` : ''}
    ${coachType === 'technical' ? `
    - טכניקת כדרור
    - טכניקת בעיטה
    - שליטה בכדור
    - מסירות
    - תרגילים טכניים` : ''}
    ${coachType === 'strength' ? `
    - אימוני כוח
    - חיזוק שרירים
    - מניעת פציעות
    - תרגילי התנגדות
    - יציבה נכונה` : ''}

    אסור בהחלט להתייחס לנושאים הבאים:
    - פציעות (הפנה לגורם רפואי מוסמך)
    - פוליטיקה
    - כלכלה
    - מוות
    - גזענות
    - סמים
    - אלכוהול
    - אלימות
    - הימורים
    - או כל נושא שאינו קשור ישירות לתחום ההתמחות שלך

    התשובות שלך תמיד יהיו:
    1. בעברית
    2. מותאמות לשחקן צעיר
    3. חיוביות ומעודדות
    4. מקצועיות ומבוססות
    5. קצרות וממוקדות
    `;

    // Check for forbidden topics
    const forbiddenTopics = [
      'פציעה', 'פציעות', 'כאב', 'התאבדות', 'מוות',
      'פוליטיקה', 'כסף', 'גזענות', 'סמים', 'אלכוהול',
      'הימורים', 'אלימות'
    ];

    const hasForbiddenTopic = forbiddenTopics.some(topic => 
      message.toLowerCase().includes(topic.toLowerCase())
    );

    if (hasForbiddenTopic) {
      return new Response(JSON.stringify({
        reply: "מצטער, אני לא יכול לדון בנושא זה. אני מתמקד רק בנושאים הקשורים לספורט ולתחום ההתמחות שלי. אם יש לך שאלות רפואיות, אנא פנה לגורם רפואי מוסמך."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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