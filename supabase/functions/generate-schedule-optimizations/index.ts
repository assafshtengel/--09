import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { activities, scheduleId } = await req.json();
    
    // Sort activities by start time
    const sortedActivities = [...activities].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });

    const optimizedSchedule = [];
    const mealTimes = new Map();

    // Process each day separately
    for (let day = 0; day < 7; day++) {
      const dayActivities = sortedActivities.filter(a => a.day_of_week === day);
      
      // Find school and training times
      const schoolActivity = dayActivities.find(a => a.activity_type === 'school');
      const trainingActivity = dayActivities.find(a => 
        a.activity_type === 'team_training' || 
        a.activity_type === 'personal_training'
      );

      // Schedule lunch based on school/training
      if (schoolActivity) {
        const schoolEndTime = new Date(`2000-01-01T${schoolActivity.end_time}`);
        const lunchTime = new Date(schoolEndTime.getTime() + 30 * 60000); // 30 minutes after school
        
        // Check if there's training soon after school
        if (trainingActivity) {
          const trainingStartTime = new Date(`2000-01-01T${trainingActivity.start_time}`);
          // If training starts within 2 hours of school ending, schedule lunch right after school
          if ((trainingStartTime.getTime() - schoolEndTime.getTime()) <= 2 * 60 * 60000) {
            mealTimes.set(`lunch-${day}`, {
              start_time: lunchTime.toTimeString().slice(0, 5),
              end_time: new Date(lunchTime.getTime() + 30 * 60000).toTimeString().slice(0, 5)
            });
          }
        } else {
          // No training, schedule lunch 30 minutes after school
          mealTimes.set(`lunch-${day}`, {
            start_time: lunchTime.toTimeString().slice(0, 5),
            end_time: new Date(lunchTime.getTime() + 30 * 60000).toTimeString().slice(0, 5)
          });
        }
      }

      // Schedule dinner based on last activity of the day
      const lastActivity = dayActivities[dayActivities.length - 1];
      if (lastActivity) {
        const lastEndTime = new Date(`2000-01-01T${lastActivity.end_time}`);
        const dinnerTime = new Date(Math.max(
          lastEndTime.getTime() + 30 * 60000,
          new Date(`2000-01-01T19:00`).getTime()
        ));
        
        mealTimes.set(`dinner-${day}`, {
          start_time: dinnerTime.toTimeString().slice(0, 5),
          end_time: new Date(dinnerTime.getTime() + 30 * 60000).toTimeString().slice(0, 5)
        });
      } else {
        // No activities, set default dinner time
        mealTimes.set(`dinner-${day}`, {
          start_time: "19:00",
          end_time: "19:30"
        });
      }
    }

    // Add meal times to optimized schedule
    for (let day = 0; day < 7; day++) {
      const lunch = mealTimes.get(`lunch-${day}`);
      const dinner = mealTimes.get(`dinner-${day}`);

      if (lunch) {
        optimizedSchedule.push({
          day_of_week: day,
          start_time: lunch.start_time,
          end_time: lunch.end_time,
          activity_type: 'meal',
          title: 'ארוחת צהריים',
          is_ai_generated: true,
          meal_type: 'lunch'
        });
      }

      if (dinner) {
        optimizedSchedule.push({
          day_of_week: day,
          start_time: dinner.start_time,
          end_time: dinner.end_time,
          activity_type: 'meal',
          title: 'ארוחת ערב',
          is_ai_generated: true,
          meal_type: 'dinner'
        });
      }
    }

    // Update the schedule with optimizations
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Save AI-generated activities
    for (const activity of optimizedSchedule) {
      const { error } = await supabase
        .from('schedule_activities')
        .insert({
          ...activity,
          schedule_id: scheduleId
        });

      if (error) {
        console.error('Error inserting activity:', error);
        throw error;
      }
    }

    // Update weekly schedule with optimization metadata
    const { error: updateError } = await supabase
      .from('weekly_schedules')
      .update({
        ai_optimizations: {
          last_optimized: new Date().toISOString(),
          meal_times: Object.fromEntries(mealTimes)
        }
      })
      .eq('id', scheduleId);

    if (updateError) {
      console.error('Error updating schedule:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        optimizedSchedule,
        message: 'Schedule optimized successfully'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      },
    );
  } catch (error) {
    console.error('Error in generate-schedule-optimizations:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      },
    );
  }
});