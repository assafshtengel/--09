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
    const { currentDate, currentTime, gameDate, gameTime, commitments, timeRemaining } = await req.json()

    if (!gameDate || !gameTime) {
      throw new Error('Match date and time are required')
    }

    // Convert game time to match time for schedule generation
    const matchDateTime = new Date(`${gameDate}T${gameTime}`)
    const currentDateTime = new Date(`${currentDate}T${currentTime}`)

    console.log('Generating schedule with:', {
      currentDateTime: currentDateTime.toISOString(),
      matchDateTime: matchDateTime.toISOString(),
      commitments,
      timeRemaining
    })

    let schedule = ''
    const timeDiff = matchDateTime.getTime() - currentDateTime.getTime()
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))

    // Generate schedule based on time until match
    if (hoursDiff <= 4) {
      // Same day schedule
      schedule = generateSameDaySchedule(currentDateTime, matchDateTime)
    } else if (hoursDiff <= 24) {
      // Next day schedule
      schedule = generateNextDaySchedule(currentDateTime, matchDateTime)
    } else {
      // Multiple days schedule
      schedule = generateMultipleDaySchedule(currentDateTime, matchDateTime)
    }

    return new Response(
      JSON.stringify({ schedule }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating schedule:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

function generateSameDaySchedule(currentDateTime: Date, matchDateTime: Date): string {
  const schedule = []
  const matchHour = matchDateTime.getHours()
  
  // Add preparation activities
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 120 * 60000))} - הגעה למגרש והתחלת חימום`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 60 * 60000))} - סיום חימום והכנה אחרונה`)
  schedule.push(`${formatTime(matchDateTime)} - תחילת משחק`)
  
  return schedule.join('\n')
}

function generateNextDaySchedule(currentDateTime: Date, matchDateTime: Date): string {
  const schedule = []
  
  // Evening before
  schedule.push(`20:00 - ארוחת ערב קלה`)
  schedule.push(`22:00 - שינה מוקדמת`)
  
  // Match day
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 240 * 60000))} - השכמה והתארגנות`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 210 * 60000))} - ארוחת בוקר קלה`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 120 * 60000))} - הגעה למגרש`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 90 * 60000))} - התחלת חימום`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 30 * 60000))} - סיום חימום והכנה אחרונה`)
  schedule.push(`${formatTime(matchDateTime)} - תחילת משחק`)
  
  return schedule.join('\n')
}

function generateMultipleDaySchedule(currentDateTime: Date, matchDateTime: Date): string {
  const schedule = []
  
  // Day before match
  schedule.push(`16:00 - אימון קל`)
  schedule.push(`19:00 - ארוחת ערב מאוזנת`)
  schedule.push(`22:00 - שינה מוקדמת`)
  
  // Match day
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 240 * 60000))} - השכמה והתארגנות`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 210 * 60000))} - ארוחת בוקר עשירה בפחמימות`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 120 * 60000))} - הגעה למגרש`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 90 * 60000))} - התחלת חימום`)
  schedule.push(`${formatTime(new Date(matchDateTime.getTime() - 30 * 60000))} - סיום חימום והכנה אחרונה`)
  schedule.push(`${formatTime(matchDateTime)} - תחילת משחק`)
  
  return schedule.join('\n')
}

function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0].substring(0, 5)
}