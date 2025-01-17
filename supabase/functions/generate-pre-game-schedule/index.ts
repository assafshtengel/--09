import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { format, addDays, differenceInDays } from "npm:date-fns";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScheduleRequest {
  currentDate: string;
  currentTime: string;
  gameDate: string;
  gameTime: string;
  schoolHours: { [key: string]: { start: string; end: string } };
  teamTrainingHours: { [key: string]: { start: string; end: string } };
  commitments: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: ScheduleRequest = await req.json();
    let schedule = "";

    // Add game day header
    schedule += `משחק ב-${input.gameDate} בשעה ${input.gameTime}\n\n`;

    // Generate daily schedules
    const startDate = new Date(input.currentDate);
    const gameDate = new Date(input.gameDate);
    const days = differenceInDays(gameDate, startDate);

    for (let i = 0; i <= days; i++) {
      const currentDate = addDays(startDate, i);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const daySchedule: string[] = [];

      // Add school hours if available
      if (input.schoolHours[dateStr]) {
        const { start, end } = input.schoolHours[dateStr];
        daySchedule.push(`${start} - ${end}: בית ספר`);
      }

      // Add training hours if available
      if (input.teamTrainingHours[dateStr]) {
        const { start, end } = input.teamTrainingHours[dateStr];
        daySchedule.push(`${start} - ${end}: אימון קבוצתי`);
      }

      if (daySchedule.length > 0) {
        schedule += `\n${format(currentDate, "EEEE, d בMMMM")}:\n`;
        schedule += daySchedule.join("\n");
      }
    }

    // Add additional commitments if any
    if (input.commitments && input.commitments !== "אין מחויבויות נוספות") {
      schedule += "\n\nמחויבויות נוספות:\n";
      schedule += input.commitments;
    }

    return new Response(
      JSON.stringify({
        schedule,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);