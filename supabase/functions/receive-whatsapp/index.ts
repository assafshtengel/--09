import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import twilio from 'https://esm.sh/twilio@4.22.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Twilio auth token for validation
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    if (!twilioAuthToken) {
      throw new Error('Missing Twilio auth token');
    }

    // Validate that the request is coming from Twilio
    const signature = req.headers.get('x-twilio-signature');
    const url = req.url;
    const params = await req.formData();
    const paramObj: Record<string, string> = {};
    params.forEach((value, key) => {
      paramObj[key] = value.toString();
    });

    const twilioClient = twilio();
    const isValid = twilioClient.validateRequest(
      twilioAuthToken,
      signature ?? '',
      url,
      paramObj
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get message details from the request
    const messageId = paramObj.MessageSid;
    const from = paramObj.From.replace('whatsapp:', '');
    const content = paramObj.Body;

    console.log('Received message:', { messageId, from, content });

    // Find the user by phone number
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('phone_number', from)
      .single();

    if (profileError || !profile) {
      console.error('Error finding user:', profileError);
      throw new Error('User not found');
    }

    // Store the message in the database
    const { error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        sender_id: profile.id,
        content: content,
        type: 'incoming',
        whatsapp_message_id: messageId,
        whatsapp_status: 'received'
      });

    if (messageError) {
      console.error('Error storing message:', messageError);
      throw messageError;
    }

    // Send a success response back to Twilio
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing message:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});