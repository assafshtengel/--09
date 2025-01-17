import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
    match_type?: string;
    playerName: string;
    havaya?: string[];
    actions?: any[];
    questionsAnswers?: Record<string, string>;
  };
}

const generateEmailHtml = (matchDetails: EmailRequest["matchDetails"]) => {
  console.log("Generating email HTML with match details:", matchDetails);

  const formatSection = (title: string, content: string) => `
    <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
      <h3 style="color: #1E40AF; margin: 0 0 10px 0;">${title}</h3>
      <div style="color: #4b5563;">${content}</div>
    </div>
  `;

  const formatList = (items: any[], formatter: (item: any) => string) => 
    items?.length > 0 
      ? `<ul style="list-style-type: none; padding: 0; margin: 0;">${items.map(formatter).join('')}</ul>`
      : 'לא נבחרו פריטים';

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>דוח טרום משחק</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; direction: rtl; text-align: right; margin: 0; padding: 20px; color: #1a1a1a;">
        <div style="background-color: #1E40AF; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0;">דוח טרום משחק - ${matchDetails.playerName || 'שחקן'}</h1>
          <p style="margin: 10px 0 0 0;">
            ${matchDetails.date}
            ${matchDetails.time ? ` | ${matchDetails.time}` : ''}
            ${matchDetails.opponent ? ` | נגד ${matchDetails.opponent}` : ''}
            ${matchDetails.match_type ? ` | ${matchDetails.match_type}` : ''}
          </p>
        </div>

        ${matchDetails.havaya?.length ? formatSection(
          'הוויות נבחרות',
          formatList(matchDetails.havaya, (h) => `
            <li style="background-color: white; padding: 10px; border-radius: 4px; margin: 8px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              ${h}
            </li>
          `)
        ) : ''}

        ${matchDetails.actions?.length ? formatSection(
          'יעדים למשחק',
          formatList(matchDetails.actions, (action) => `
            <li style="background-color: white; padding: 10px; border-radius: 4px; margin: 8px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="font-weight: bold;">${action.name}</div>
              ${action.goal ? `<div style="color: #6b7280; margin-top: 4px;">יעד: ${action.goal}</div>` : ''}
            </li>
          `)
        ) : ''}

        ${Object.keys(matchDetails.questionsAnswers || {}).length ? formatSection(
          'תשובות לשאלות',
          formatList(
            Object.entries(matchDetails.questionsAnswers || {}),
            ([question, answer]) => `
              <li style="background-color: white; padding: 10px; border-radius: 4px; margin: 8px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <div style="font-weight: bold;">${question}</div>
                <div style="margin-top: 4px;">${answer}</div>
              </li>
            `
          )
        ) : ''}
      </body>
    </html>
  `;

  console.log("Generated HTML:", html);
  return html;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Received request:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return new Response(
      JSON.stringify({ 
        error: "Server configuration error: RESEND_API_KEY is not set",
        details: "Please set up the RESEND_API_KEY in Supabase Edge Function secrets"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const { email, matchDetails }: EmailRequest = await req.json();
    
    console.log("Processing email request to:", email);
    console.log("Match details:", matchDetails);

    if (!email || !matchDetails) {
      throw new Error("Missing required fields: email or matchDetails");
    }

    // For testing, we'll use the default Resend testing domain
    const from = "onboarding@resend.dev";
    const to = Array.isArray(email) ? email : [email];
    
    const emailHtml = generateEmailHtml(matchDetails);
    
    console.log("Sending email via Resend API");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: `דוח טרום משחק - ${matchDetails.playerName} ${matchDetails.opponent ? `נגד ${matchDetails.opponent}` : ''}`,
        html: emailHtml,
      }),
    });

    const responseData = await res.text();
    console.log("Resend API response:", responseData);

    if (!res.ok) {
      // If it's a validation error about sending to unverified emails
      if (responseData.includes("verify a domain")) {
        return new Response(
          JSON.stringify({
            error: "Domain not verified",
            message: "Please verify your domain at https://resend.com/domains. For testing, you can only send emails to verified emails",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(responseData);
    }

    return new Response(responseData, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-pre-match-report function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "If you're using a custom domain, please verify it at https://resend.com/domains. Meanwhile, emails will be sent from onboarding@resend.dev"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);