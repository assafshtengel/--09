import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VALID_ACTIVITY_TYPES = [
  'school',
  'team_training',
  'personal_training',
  'mental_training',
  'other',
  'free_time',
  'lunch',
  'wake_up',
  'departure',
  'team_game'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { sleepHours, screenTime, schoolHours, teamTraining } = await req.json()
    console.log('Received input:', { sleepHours, screenTime, schoolHours, teamTraining })

    // Validate inputs
    if (!sleepHours || !screenTime) {
      throw new Error('Missing required fields')
    }

    // Generate schedule with valid activity types
    const schedule = []

    // Add school hours if provided
    if (schoolHours) {
      schedule.push({
        activity_type: 'school',
        start_time: schoolHours.start,
        end_time: schoolHours.end,
        title: 'בית ספר'
      })
    }

    // Add team training if provided
    if (teamTraining) {
      schedule.push({
        activity_type: 'team_training',
        start_time: teamTraining,
        end_time: addMinutes(teamTraining, 90),
        title: 'אימון קבוצתי'
      })
    }

    // Add meals (using valid 'lunch' type)
    const meals = [
      { time: '07:30', title: 'ארוחת בוקר' },
      { time: '13:00', title: 'ארוחת צהריים' },
      { time: '19:00', title: 'ארוחת ערב' }
    ]

    meals.forEach(meal => {
      schedule.push({
        activity_type: 'lunch',
        start_time: meal.time,
        end_time: addMinutes(meal.time, 30),
        title: meal.title
      })
    })

    // Add sleep (using valid 'other' type)
    schedule.push({
      activity_type: 'other',
      start_time: '22:00',
      end_time: `0${sleepHours}:00`,
      title: 'שינה'
    })

    return new Response(
      JSON.stringify({ schedule }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-pre-game-schedule:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to add minutes to time string
function addMinutes(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, mins)
  date.setMinutes(date.getMinutes() + minutes)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}