import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Twilio } from "npm:twilio@4.19.0";

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
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { message, recipientNumber } = await req.json();

    // Validate required fields
    if (!message || !recipientNumber) {
      throw new Error('Missing required fields: message and recipientNumber are required');
    }

    // Initialize Twilio client
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Missing Twilio credentials');
      throw new Error('Server configuration error: Missing Twilio credentials');
    }

    const client = new Twilio(accountSid, authToken);

    // Format phone number if needed
    const formattedNumber = recipientNumber.startsWith('+') ? recipientNumber : `+${recipientNumber}`;

    // Send WhatsApp message
    const twilioMessage = await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${formattedNumber}`,
    });

    console.log('Message sent successfully:', twilioMessage.sid);

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
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Method not allowed' ? 405 : 500,
      }
    );
  }
});