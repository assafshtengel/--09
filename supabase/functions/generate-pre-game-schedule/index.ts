import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sleepHours, screenTime, hasSchool, schoolDays } = await req.json()

    // Generate base schedule
    const schedule = []
    const days = [0, 1, 2, 3, 4, 5, 6] // Sunday to Saturday

    days.forEach(day => {
      // Add sleep schedule
      schedule.push({
        day_of_week: day,
        start_time: '22:00',
        end_time: '07:00',
        activity_type: 'sleep',
        title: 'שינה'
      })

      // Add school if applicable
      if (hasSchool && schoolDays?.[day]) {
        schedule.push({
          day_of_week: day,
          start_time: schoolDays[day].startTime,
          end_time: schoolDays[day].endTime,
          activity_type: 'school',
          title: 'בית ספר'
        })
      }

      // Add meals
      const meals = [
        { time: '07:30', title: 'ארוחת בוקר' },
        { time: '13:00', title: 'ארוחת צהריים' },
        { time: '19:00', title: 'ארוחת ערב' }
      ]

      meals.forEach(meal => {
        schedule.push({
          day_of_week: day,
          start_time: meal.time,
          end_time: addMinutes(meal.time, 30),
          activity_type: 'meal',
          title: meal.title
        })
      })
    })

    return new Response(
      JSON.stringify({ schedule }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      },
    )
  }
})

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMinutes = totalMinutes % 60
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}