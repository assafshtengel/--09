import { Card } from "@/components/ui/card";

interface WeeklyScheduleDisplayProps {
  schedule: any;
}

export const WeeklyScheduleDisplay = ({ schedule }: WeeklyScheduleDisplayProps) => {
  if (!schedule) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Enter your schedule to see it displayed here
      </div>
    );
  }

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 gap-1">
            <div className="h-12" /> {/* Empty corner cell */}
            {DAYS.map((day) => (
              <div key={day} className="h-12 flex items-center justify-center font-semibold">
                {day}
              </div>
            ))}
            
            {HOURS.map((hour) => (
              <>
                <div key={`hour-${hour}`} className="h-12 flex items-center justify-center text-sm">
                  {hour}:00
                </div>
                {DAYS.map((day) => {
                  const activities = [];
                  
                  // Check sleep schedule
                  if (schedule.sleep[day]) {
                    const sleepStart = parseInt(schedule.sleep[day].start?.split(":")[0]);
                    const sleepEnd = parseInt(schedule.sleep[day].end?.split(":")[0]);
                    if (hour >= sleepStart || hour < sleepEnd) {
                      activities.push("sleep");
                    }
                  }
                  
                  // Check team practices
                  const practice = schedule.teamPractices.find((p: any) => 
                    p.day === day && parseInt(p.time?.split(":")[0]) === hour
                  );
                  if (practice) activities.push("practice");
                  
                  // Check personal training
                  const training = schedule.personalTraining.find((t: any) => 
                    t.day === day && parseInt(t.time?.split(":")[0]) === hour
                  );
                  if (training) activities.push("training");
                  
                  // Check games
                  const game = schedule.games.find((g: any) => 
                    g.day === day && parseInt(g.time?.split(":")[0]) === hour
                  );
                  if (game) activities.push("game");
                  
                  let backgroundColor = "bg-gray-100";
                  if (activities.includes("sleep")) backgroundColor = "bg-blue-100";
                  if (activities.includes("practice")) backgroundColor = "bg-green-100";
                  if (activities.includes("training")) backgroundColor = "bg-yellow-100";
                  if (activities.includes("game")) backgroundColor = "bg-red-100";
                  
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`h-12 border ${backgroundColor} transition-colors`}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {schedule.notes && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground">{schedule.notes}</p>
        </Card>
      )}
    </div>
  );
};