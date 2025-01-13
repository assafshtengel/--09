import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email } = await req.json();

    // Get admin credentials
    const { data: adminData, error: adminError } = await supabaseClient
      .from("admin_credentials")
      .select("email, phone_number")
      .eq("email", "socr.co.il@gmail.com")
      .single();

    if (adminError || !adminData) {
      throw new Error("Admin not found");
    }

    // Send email using your preferred email service
    // For this example, we'll just return the credentials
    // In production, implement proper email sending

    return new Response(
      JSON.stringify({ message: "Credentials sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});