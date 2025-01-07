import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchId } = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get match data and pre-match report
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
      .single();

    if (matchError) throw matchError;

    // Get previous matches data
    const { data: previousMatches, error: prevMatchError } = await supabaseClient
      .from('matches')
      .select(`
        *,
        pre_match_reports (
          questions_answers,
          actions
        )
      `)
      .eq('player_id', match.player_id)
      .order('match_date', { ascending: false })
      .limit(3);

    if (prevMatchError) throw prevMatchError;

    const insights = "תובנות יתווספו בקרוב"; // Default message: "Insights will be added soon"

    return new Response(
      JSON.stringify({ insights }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});