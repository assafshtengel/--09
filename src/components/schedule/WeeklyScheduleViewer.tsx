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
  // Generate hours from 06:00 to 23:00
  const hours = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

  const getActivityColor = (type: string) => {
    switch (type) {
      case "school":
        return "bg-blue-100 border-blue-200";
      case "team_training":
        return "bg-green-100 border-green-200";
      case "personal_training":
      case "mental_training":
        return "bg-purple-100 border-purple-200";
      case "lunch":
        return "bg-yellow-100 border-yellow-200";
      case "free_time":
        return "bg-gray-100 border-gray-200";
      case "wake_up":
        return "bg-orange-100 border-orange-200";
      case "departure":
        return "bg-red-100 border-red-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "school":
        return "🏫";
      case "team_training":
        return "⚽";
      case "personal_training":
        return "🏃";
      case "mental_training":
        return "🧠";
      case "lunch":
        return "🍽️";
      case "free_time":
        return "🎮";
      case "wake_up":
        return "⏰";
      case "departure":
        return "🚗";
      default:
        return "📝";
    }
  };

  return (
    <Card className="p-4 overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-right">תצוגת מערכת שבועית</h3>
      <div className="flex">
        {/* Time grid */}
        <div className="w-16 flex-shrink-0">
          {hours.map((hour) => (
            <div key={hour} className="h-20 border-b border-gray-200 text-sm text-gray-500 text-center">
              {hour}
            </div>
          ))}
        </div>
        
        {/* Days grid */}
        <div className="flex-1 grid grid-cols-7 gap-1">
          {days.map((day, dayIndex) => (
            <div key={day} className="min-w-[120px]">
              <div className="font-bold mb-2 text-center bg-gray-50 p-2 rounded">{day}</div>
              <div className="relative h-[900px] border-r border-gray-100"> {/* Adjusted height for 18 hours * 50px */}
                {activities
                  .filter((activity) => activity.day_of_week === dayIndex)
                  .map((activity, activityIndex) => {
                    const startHour = parseInt(activity.start_time.split(':')[0]);
                    const startMinute = parseInt(activity.start_time.split(':')[1]);
                    const endHour = parseInt(activity.end_time.split(':')[0]);
                    const endMinute = parseInt(activity.end_time.split(':')[1]);
                    
                    // Adjust the position calculation to account for the 6am start
                    const top = ((startHour - 6) * 60 + startMinute) * (50 / 60);
                    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (50 / 60);
                    
                    return (
                      <div
                        key={activityIndex}
                        className={`${getActivityColor(activity.activity_type)} absolute w-[95%] p-2 rounded-md border text-sm overflow-hidden transition-all hover:shadow-md`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          minHeight: '24px'
                        }}
                      >
                        <div className="flex items-center gap-1 font-medium">
                          <span>{getActivityIcon(activity.activity_type)}</span>
                          <span className="truncate">{activity.title}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
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