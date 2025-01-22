import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIMEOUT_MS = 8000; // 8 seconds timeout

serve(async (req) => {
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

    // Create a promise that resolves with the schedule generation
    const schedulePromise = new Promise((resolve, reject) => {
      const timeDiff = matchDateTime.getTime() - currentDateTime.getTime()
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))

      let schedule = ''
      try {
        if (hoursDiff <= 4) {
          schedule = generateSameDaySchedule(currentDateTime, matchDateTime, commitments)
        } else if (hoursDiff <= 24) {
          schedule = generateNextDaySchedule(currentDateTime, matchDateTime, commitments)
        } else {
          schedule = generateMultipleDaySchedule(currentDateTime, matchDateTime, commitments)
        }
        resolve(schedule)
      } catch (error) {
        reject(error)
      }
    })

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'))
      }, TIMEOUT_MS)
    })

    // Race between schedule generation and timeout
    const schedule = await Promise.race([schedulePromise, timeoutPromise])

    return new Response(
      JSON.stringify({ schedule, status: 'success' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating schedule:', error)
    
    if (error.message === 'TIMEOUT') {
      return new Response(
        JSON.stringify({ 
          error: 'Schedule generation timeout', 
          status: 'timeout',
          redirectUrl: 'https://did.li/Kld6q'
        }),
        { 
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({ error: error.message, status: 'error' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

function parseCommitments(commitments: string) {
  if (!commitments) return []
  
  // Split commitments by newline and parse times
  return commitments.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const timeMatch = line.match(/(\d{1,2}:\d{2})/)
      if (timeMatch) {
        return {
          time: timeMatch[1],
          activity: line
        }
      }
      return null
    })
    .filter(item => item !== null)
}

function generateSameDaySchedule(currentDateTime: Date, matchDateTime: Date, commitments: string): string {
  const userCommitments = parseCommitments(commitments)
  const schedule = []
  
  // Add preparation activities considering commitments
  const commitmentTimes = new Set(userCommitments.map(c => c.time))
  
  // Add user commitments first
  userCommitments.forEach(commitment => {
    schedule.push(`${commitment.time} - ${commitment.activity}`)
  })

  // Add match preparation activities if they don't conflict with commitments
  const matchPrep = [
    { time: new Date(matchDateTime.getTime() - 120 * 60000), activity: 'הגעה למגרש והתחלת חימום' },
    { time: new Date(matchDateTime.getTime() - 60 * 60000), activity: 'סיום חימום והכנה אחרונה' },
    { time: matchDateTime, activity: 'תחילת משחק' }
  ]

  matchPrep.forEach(prep => {
    const timeStr = formatTime(prep.time)
    if (!commitmentTimes.has(timeStr)) {
      schedule.push(`${timeStr} - ${prep.activity}`)
    }
  })
  
  return schedule.sort().join('\n')
}

function generateNextDaySchedule(currentDateTime: Date, matchDateTime: Date, commitments: string): string {
  const userCommitments = parseCommitments(commitments)
  const schedule = []
  
  // Add user commitments
  userCommitments.forEach(commitment => {
    schedule.push(`${commitment.time} - ${commitment.activity}`)
  })

  // Add standard schedule items that don't conflict with commitments
  const commitmentTimes = new Set(userCommitments.map(c => c.time))
  const standardItems = [
    { time: '20:00', activity: 'ארוחת ערב קלה' },
    { time: '22:00', activity: 'שינה מוקדמת' },
    { time: formatTime(new Date(matchDateTime.getTime() - 240 * 60000)), activity: 'השכמה והתארגנות' },
    { time: formatTime(new Date(matchDateTime.getTime() - 210 * 60000)), activity: 'ארוחת בוקר קלה' },
    { time: formatTime(new Date(matchDateTime.getTime() - 120 * 60000)), activity: 'הגעה למגרש' },
    { time: formatTime(new Date(matchDateTime.getTime() - 90 * 60000)), activity: 'התחלת חימום' },
    { time: formatTime(new Date(matchDateTime.getTime() - 30 * 60000)), activity: 'סיום חימום והכנה אחרונה' },
    { time: formatTime(matchDateTime), activity: 'תחילת משחק' }
  ]

  standardItems.forEach(item => {
    if (!commitmentTimes.has(item.time)) {
      schedule.push(`${item.time} - ${item.activity}`)
    }
  })
  
  return schedule.sort().join('\n')
}

function generateMultipleDaySchedule(currentDateTime: Date, matchDateTime: Date, commitments: string): string {
  const userCommitments = parseCommitments(commitments)
  const schedule = []
  
  // Add user commitments
  userCommitments.forEach(commitment => {
    schedule.push(`${commitment.time} - ${commitment.activity}`)
  })

  // Add standard schedule items that don't conflict with commitments
  const commitmentTimes = new Set(userCommitments.map(c => c.time))
  const standardItems = [
    { time: '16:00', activity: 'אימון קל' },
    { time: '19:00', activity: 'ארוחת ערב מאוזנת' },
    { time: '22:00', activity: 'שינה מוקדמת' },
    { time: formatTime(new Date(matchDateTime.getTime() - 240 * 60000)), activity: 'השכמה והתארגנות' },
    { time: formatTime(new Date(matchDateTime.getTime() - 210 * 60000)), activity: 'ארוחת בוקר עשירה בפחמימות' },
    { time: formatTime(new Date(matchDateTime.getTime() - 120 * 60000)), activity: 'הגעה למגרש' },
    { time: formatTime(new Date(matchDateTime.getTime() - 90 * 60000)), activity: 'התחלת חימום' },
    { time: formatTime(new Date(matchDateTime.getTime() - 30 * 60000)), activity: 'סיום חימום והכנה אחרונה' },
    { time: formatTime(matchDateTime), activity: 'תחילת משחק' }
  ]

  standardItems.forEach(item => {
    if (!commitmentTimes.has(item.time)) {
      schedule.push(`${item.time} - ${item.activity}`)
    }
  })
  
  return schedule.sort().join('\n')
}

function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0].substring(0, 5)
}