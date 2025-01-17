import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { format, parse, addDays, isValid } from "https://deno.land/x/date_fns@v2.22.1/index.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

const getMealPlan = (gameHour: number) => {
  // Convert game hour to number for comparison
  const gameTime = parseInt(gameHour.toString());
  
  if (gameTime >= 17) {
    return `
    07:00 - ארוחת בוקר: דייסת קוואקר עם חלב/משקה שקדים + פירות חתוכים, או חביתה עם ירקות ולחם מלא
    10:00 - חטיף בוקר: פרי (בננה/תפוח) + חופן אגוזים/שקדים
    13:00 - ארוחת צהריים: פסטה עם רוטב עגבניות ונתחי עוף/הודו/טונה, לצד ירקות
    15:30 - חטיף לפני המשחק: בננה או תמרים, או חטיף אנרגיה
    ${gameTime}:00 - משחק
    ${gameTime + 2}:00 - ארוחת התאוששות: שייק חלבון עם פירות או ארוחה עשירה בחלבון ופחמימות
    `;
  } else if (gameTime >= 13 && gameTime < 17) {
    return `
    07:00 - ארוחת בוקר: דייסת קוואקר עם חלב/משקה סויה/שקדים, תוספת פירות ואגוזים
    10:00 - ארוחה עיקרית: פסטה עם רוטב עגבניות קל + עוף/טונה
    ${gameTime - 1}:30 - חטיף קל: פרי (בננה/תמרים) או חטיף אנרגיה
    ${gameTime}:00 - משחק
    ${gameTime + 2}:00 - ארוחת התאוששות: כריך מלחם מלא עם חזה עוף/גבינה לבנה/טונה + ירקות
    `;
  } else {
    return `
    ${gameTime - 4}:00 - ארוחת בוקר מוקדמת: דייסת קוואקר עם חלב/משקה סויה/שקדים + פרי
    ${gameTime - 2}:00 - חטיף קל: פרי (בננה/תפוח/תמרים) + חופן אגוזים/שקדים
    ${gameTime}:00 - משחק
    ${gameTime + 2}:00 - ארוחת התאוששות: שייק חלבון או כריך מלא עם חלבון
    ${gameTime + 4}:00 - ארוחת צהריים מלאה: אורז/פסטה + חזה עוף/דג, סלט ירקות
    `;
  }
};

const getWakeUpTime = (commitments: string) => {
  // Check if there's school mentioned in commitments
  const schoolMatch = commitments.match(/בית ספר.*?(\d{1,2}:\d{2})/);
  
  if (schoolMatch) {
    const schoolTime = schoolMatch[1];
    const [hours, minutes] = schoolTime.split(':').map(Number);
    
    // Calculate wake up time 1 hour and 15 minutes before school
    let wakeUpHours = hours - 1;
    let wakeUpMinutes = minutes - 15;
    
    if (wakeUpMinutes < 0) {
      wakeUpHours--;
      wakeUpMinutes += 60;
    }
    
    // Ensure wake up time is not before 6:00
    if (wakeUpHours < 6 || (wakeUpHours === 6 && wakeUpMinutes < 0)) {
      return "06:00";
    }
    
    return `${wakeUpHours.toString().padStart(2, '0')}:${wakeUpMinutes.toString().padStart(2, '0')}`;
  }
  
  // Default wake up time if no school info
  return "06:45";
};

const formatDateForPrompt = (dateStr: string) => {
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date());
    if (!isValid(date)) {
      console.error('Invalid date string:', dateStr);
      return dateStr;
    }
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received request to generate pre-game schedule')
    const { currentDate, currentTime, gameDate, gameTime, commitments, timeRemaining } = await req.json()

    console.log('Request parameters:', { currentDate, currentTime, gameDate, gameTime, commitments, timeRemaining })

    // Validate dates
    const startDate = parse(`${currentDate} ${currentTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDate = parse(`${gameDate} ${gameTime}`, 'yyyy-MM-dd HH:mm', new Date());

    if (!isValid(startDate) || !isValid(endDate)) {
      throw new Error('Invalid date format provided');
    }

    if (endDate <= startDate) {
      throw new Error('Game date must be after current date and time');
    }

    const gameHour = parseInt(gameTime.split(':')[0]);
    const mealPlan = getMealPlan(gameHour);
    const wakeUpTime = getWakeUpTime(commitments);

    const formattedCurrentDate = formatDateForPrompt(currentDate);
    const formattedGameDate = formatDateForPrompt(gameDate);

    const prompt = `
    אני שחקן כדורגל וצריך סדר יום מפורט החל מהתאריך ${formattedCurrentDate} בשעה ${currentTime} ועד למשחק שמתחיל בתאריך ${formattedGameDate} בשעה ${gameTime}.
    הזמן שנותר עד למשחק: ${timeRemaining}
    המחויבויות שלי הן: ${commitments}
    
    תוכנית הארוחות המומלצת:
    ${mealPlan}
    
    זמן התעוררות: ${wakeUpTime}
    
    אנא צור לי סדר יום מפורט עם הדגשים הבאים:
    1. זמן התעוררות לפי הזמן שחושב למעלה (${wakeUpTime})
    2. תכנון של 9 שעות שינה בכל לילה
    3. הגעה למגרש שעה וחצי לפני תחילת המשחק
    4. זמני ארוחות מדויקים לפי התוכנית שצוינה למעלה
    5. זמן מוגדר למתיחות וחימום
    6. זמן לקריאת דוח טרום משחק והכנה מנטלית
    7. הגבלת זמן מסכים (טלפון, טלוויזיה, מחשב)
    8. התייחסות למחויבויות שציינתי
    9. ציון מעבר יום בצורה ברורה כשיש פעילות לילה
    
    חשוב:
    - התחל את סדר היום מהתאריך והשעה הנוכחית בדיוק (${formattedCurrentDate} ${currentTime})
    - השעות הן בפורמט של 24 שעות (למשל, 10:00 היא עשר בבוקר)
    - יש לכלול את כל הארוחות לפי התוכנית שצוינה
    - יש להקפיד על זמני מנוחה בין פעילויות
    - אם יש פעילות לילה, יש לציין את היום הבא בצורה ברורה
    - בכל מעבר יום יש לציין את התאריך החדש בפורמט [dd/MM/yyyy]
    
    אנא הצג את התשובה בפורמט הבא:
    [שעה] - [פעילות/ארוחה + פירוט]

    כאשר יש מעבר יום, הצג כך:
    *** יום חדש: [dd/MM/yyyy] ***
    [שעה] - [פעילות/ארוחה + פירוט]
    `

    console.log('Sending request to OpenAI with prompt')

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
            content: 'אתה מאמן כדורגל מקצועי שעוזר לשחקנים להתכונן למשחקים. התשובות שלך תמיד בעברית ומותאמות לשחקן צעיר.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    console.log('Received response from OpenAI:', data)

    const schedule = data.choices[0].message.content

    return new Response(
      JSON.stringify({ schedule }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in generate-pre-game-schedule function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
