import { Card } from "@/components/ui/card";

interface Activity {
  day_of_week: number;
  start_time: string;
  end_time: string;
  activity_type: string;
  title?: string;
}

interface WeeklyScheduleViewerProps {
  activities: Activity[];
}

export const WeeklyScheduleViewer = ({ activities }: WeeklyScheduleViewerProps) => {
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const getActivityColor = (type: string) => {
    switch (type) {
      case "school":
        return "bg-blue-100";
      case "team_training":
        return "bg-green-100";
      case "personal_training":
      case "mental_training":
        return "bg-purple-100";
      case "lunch":
        return "bg-yellow-100";
      case "free_time":
        return "bg-gray-100";
      case "wake_up":
        return "bg-orange-100";
      case "departure":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <Card className="p-4 overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-right">תצוגת מערכת שבועית</h3>
      <div className="flex">
        {/* Time grid */}
        <div className="w-20 flex-shrink-0">
          {hours.map((hour) => (
            <div key={hour} className="h-20 border-b border-gray-200 text-sm text-gray-500 text-center">
              {hour}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="flex-1 grid grid-cols-7 gap-2">
          {days.map((day, dayIndex) => (
            <div key={day} className="min-w-[120px]">
              <div className="font-bold mb-2 text-center">{day}</div>
              <div className="relative h-[1200px]"> {/* 24 hours * 50px */}
                {activities
                  .filter((activity) => activity.day_of_week === dayIndex)
                  .map((activity, activityIndex) => {
                    const startHour = parseInt(activity.start_time.split(':')[0]);
                    const startMinute = parseInt(activity.start_time.split(':')[1]);
                    const endHour = parseInt(activity.end_time.split(':')[0]);
                    const endMinute = parseInt(activity.end_time.split(':')[1]);
                    
                    const top = (startHour * 60 + startMinute) * (50 / 60);
                    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (50 / 60);
                    
                    return (
                      <div
                        key={activityIndex}
                        className={`${getActivityColor(activity.activity_type)} absolute w-full p-2 rounded text-sm overflow-hidden`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          minHeight: '20px'
                        }}
                      >
                        <div className="font-semibold">{activity.title}</div>
                        <div className="text-xs">
                          {activity.start_time} - {activity.end_time}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};