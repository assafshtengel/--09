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
    playerName: string;
    havaya?: string[];
    actions?: any[];
    questionsAnswers?: Record<string, string>;
  };
}

const generateEmailHtml = (matchDetails: EmailRequest["matchDetails"], imageData: string) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>דוח טרום משחק</title>
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
          .section {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8fafc;
            border-radius: 8px;
          }
          .section-title {
            color: #1E40AF;
            font-size: 18px;
            margin-bottom: 10px;
          }
          .item {
            padding: 8px;
            background-color: #ffffff;
            border-radius: 4px;
            margin: 5px 0;
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
          <h1 class="title">דוח טרום משחק - ${matchDetails.playerName}</h1>
        </div>
        <div class="details">
          <p><strong>תאריך:</strong> ${matchDetails.date}</p>
          ${matchDetails.time ? `<p><strong>שעה:</strong> ${matchDetails.time}</p>` : ''}
          ${matchDetails.opponent ? `<p><strong>נגד:</strong> ${matchDetails.opponent}</p>` : ''}
          ${matchDetails.match_type ? `<p><strong>סוג משחק:</strong> ${matchDetails.match_type}</p>` : ''}
        </div>

        ${matchDetails.havaya && matchDetails.havaya.length > 0 ? `
          <div class="section">
            <h2 class="section-title">הוויות נבחרות</h2>
            ${matchDetails.havaya.map(h => `<div class="item">${h}</div>`).join('')}
          </div>
        ` : ''}

        ${matchDetails.actions && matchDetails.actions.length > 0 ? `
          <div class="section">
            <h2 class="section-title">יעדים למשחק</h2>
            ${matchDetails.actions.map(action => `
              <div class="item">
                <div>${action.name}</div>
                ${action.goal ? `<div style="font-size: 0.9em; color: #6b7280;">יעד: ${action.goal}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${matchDetails.questionsAnswers && Object.keys(matchDetails.questionsAnswers).length > 0 ? `
          <div class="section">
            <h2 class="section-title">תשובות לשאלות</h2>
            ${Object.entries(matchDetails.questionsAnswers).map(([question, answer]) => `
              <div class="item">
                <div style="font-weight: bold;">${question}</div>
                <div style="margin-top: 4px;">${answer}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

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

    // For testing, we'll use the default Resend testing domain
    const from = "onboarding@resend.dev";
    const to = Array.isArray(email) ? email : [email];
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: `דוח טרום משחק - ${matchDetails.playerName} - ${matchDetails.date}`,
        html: generateEmailHtml(matchDetails, imageData),
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
            message: "Please verify your domain at https://resend.com/domains. For testing, you can only send emails to socr.co.il@gmail.com",
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