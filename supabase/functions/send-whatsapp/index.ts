import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Twilio } from "npm:twilio@4.19.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  recipientId?: string;
  message: string;
  notificationId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { recipientId, message, notificationId } = await req.json() as WhatsAppMessage;

    // Initialize Twilio client
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio credentials');
    }

    const client = new Twilio(accountSid, authToken);

    // If recipientId is provided, get the recipient's phone number
    let toNumber;
    if (recipientId) {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('phone_number')
        .eq('id', recipientId)
        .single();

      if (profileError || !profile?.phone_number) {
        throw new Error('Failed to get recipient phone number');
      }

      toNumber = profile.phone_number;
    }

    // Send WhatsApp message
    const twilioMessage = await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${toNumber}`,
    });

    console.log('Message sent successfully:', twilioMessage.sid);

    // Update notification status
    const { error: updateError } = await supabaseClient
      .from('notifications')
      .update({ status: 'sent' })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Failed to update notification status:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: twilioMessage.sid }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});