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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, imageData, matchDetails }: EmailRequest = await req.json();

    // Ensure email is properly formatted as an array
    const to = Array.isArray(email) ? email : [email];
    
    console.log("Attempting to send email to:", to);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Pre Match Report <onboarding@resend.dev>", // Using the default Resend domain
        to,
        subject: `Pre Match Report - ${matchDetails.date}`,
        html: `
          <div>
            <h1>Pre Match Report</h1>
            <p>Date: ${matchDetails.date}</p>
            ${matchDetails.time ? `<p>Time: ${matchDetails.time}</p>` : ''}
            ${matchDetails.opponent ? `<p>Opponent: ${matchDetails.opponent}</p>` : ''}
            ${matchDetails.match_type ? `<p>Match Type: ${matchDetails.match_type}</p>` : ''}
            <img src="${imageData}" alt="Pre Match Report" style="max-width: 100%;" />
          </div>
        `,
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
    
    // Return a more detailed error response
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