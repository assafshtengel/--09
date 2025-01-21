import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { matchDate, matchTime } = await req.json()

    if (!matchDate || !matchTime) {
      throw new Error('Match date and time are required')
    }

    const matchDateTime = new Date(`${matchDate}T${matchTime}`)
    const schedule = generateSchedule(matchDateTime)

    return new Response(
      JSON.stringify({ schedule }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

function generateSchedule(matchDateTime: Date) {
  const schedule = []
  const matchDay = new Date(matchDateTime)
  
  // Day before match
  const dayBefore = new Date(matchDay)
  dayBefore.setDate(dayBefore.getDate() - 1)
  
  schedule.push({
    day: formatDate(dayBefore),
    activities: [
      {
        time: "20:00",
        activity: "ארוחת ערב קלה ומזינה",
        description: "להימנע ממאכלים כבדים או חריפים"
      },
      {
        time: "22:00",
        activity: "שינה מוקדמת",
        description: "לפחות 8 שעות שינה"
      }
    ]
  })

  // Match day
  const matchHour = matchDateTime.getHours()
  const wakeUpTime = new Date(matchDay)
  wakeUpTime.setHours(matchHour - 4) // Wake up 4 hours before match

  schedule.push({
    day: formatDate(matchDay),
    activities: [
      {
        time: formatTime(wakeUpTime),
        activity: "השכמה והתארגנות",
        description: "מקלחת קצרה ומרעננת"
      },
      {
        time: formatTime(new Date(wakeUpTime.getTime() + 30 * 60000)),
        activity: "ארוחת בוקר קלה",
        description: "פחמימות זמינות ומעט חלבון"
      },
      {
        time: formatTime(new Date(matchDateTime.getTime() - 90 * 60000)),
        activity: "הגעה למגרש",
        description: "90 דקות לפני המשחק"
      },
      {
        time: formatTime(new Date(matchDateTime.getTime() - 60 * 60000)),
        activity: "חימום והכנה",
        description: "חימום מסודר ותרגילי מתיחות"
      },
      {
        time: formatTime(matchDateTime),
        activity: "תחילת משחק",
        description: "בהצלחה!"
      }
    ]
  })

  return schedule
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0].substring(0, 5)
}