import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  imageData: string;
  matchDetails: {
    date: string;
    time?: string;
    opponent?: string;
    match_type?: string;
  };
}

const generateEmailHtml = (matchDetails: EmailRequest["matchDetails"], imageData: string) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pre Match Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            direction: rtl;
            text-align: right;
            margin: 0;
            padding: 20px;
          }
          .header {
            margin-bottom: 20px;
          }
          .title {
            color: #1E40AF;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .details {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .details p {
            margin: 5px 0;
            color: #4b5563;
          }
          .image-container {
            margin-top: 20px;
          }
          img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">דוח טרום משחק</h1>
        </div>
        <div class="details">
          <p><strong>תאריך:</strong> ${matchDetails.date}</p>
          ${matchDetails.time ? `<p><strong>שעה:</strong> ${matchDetails.time}</p>` : ''}
          ${matchDetails.opponent ? `<p><strong>נגד:</strong> ${matchDetails.opponent}</p>` : ''}
          ${matchDetails.match_type ? `<p><strong>סוג משחק:</strong> ${matchDetails.match_type}</p>` : ''}
        </div>
        <div class="image-container">
          <img src="${imageData}" alt="Pre Match Report" />
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, imageData, matchDetails }: EmailRequest = await req.json();
    
    console.log("Sending email to:", email);
    console.log("Match details:", matchDetails);

    const to = Array.isArray(email) ? email : [email];
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // Using default Resend domain until custom domain is verified
        to,
        subject: `דוח טרום משחק - ${matchDetails.date}`,
        html: generateEmailHtml(matchDetails, imageData),
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error from Resend:", error);
      throw new Error(error);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);
    
    return new Response(JSON.stringify(data), {
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