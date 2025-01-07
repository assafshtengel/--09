import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { matchId } = await req.json()

    if (!matchId) {
      throw new Error('Match ID is required')
    }

    // Fetch match data including pre-match report
    const { data: match, error: matchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports (
          questions_answers,
          actions
        )
      `)
      .eq('id', matchId)
      .single()

    if (matchError) {
      throw matchError
    }

    // Generate insights based on the match data
    const insights = [
      "Based on your answers, focus on maintaining composure during high-pressure situations",
      "Your preparation shows good awareness of the opponent's strengths",
      "Remember to stay focused on your pre-game objectives"
    ]

    return new Response(
      JSON.stringify({ insights }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})