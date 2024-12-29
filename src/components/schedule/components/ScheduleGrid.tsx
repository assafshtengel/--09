import { formatTime } from "@/lib/utils";
import { ActivityBlock } from "./ActivityBlock";

interface Activity {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  activity_type: string;
  title?: string;
}

interface ScheduleGridProps {
  activities: Activity[];
  days: string[];
  hours: string[];
  isMobile: boolean;
  selectedDay: number;
  onDeleteActivity: (id?: string) => void;
}

export const ScheduleGrid = ({ 
  activities, 
  days, 
  hours, 
  isMobile, 
  selectedDay,
  onDeleteActivity 
}: ScheduleGridProps) => {
  const getActivityColor = (type: string) => {
    switch (type) {
      case "school":
        return "bg-blue-100 border-blue-200";
      case "team_training":
        return "bg-green-100 border-green-200";
      case "team_game":
        return "bg-red-100 border-red-200";
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
      case "team_game":
        return "🏆";
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

  const renderDayView = (dayIndex: number) => (
    <div className="min-w-[120px]">
      <div className="font-bold mb-2 text-center bg-gray-50 p-2 rounded">{days[dayIndex]}</div>
      <div className="relative h-[900px] border-r border-gray-100">
        {activities
          .filter((activity) => activity.day_of_week === dayIndex)
          .map((activity, activityIndex) => {
            const startTime = formatTime(activity.start_time);
            const endTime = formatTime(activity.end_time);
            
            const startHour = parseInt(startTime.split(':')[0]);
            const startMinute = parseInt(startTime.split(':')[1]);
            const endHour = parseInt(endTime.split(':')[0]);
            const endMinute = parseInt(endTime.split(':')[1]);
            
            const top = ((startHour - 6) * 60 + startMinute) * (50 / 60);
            const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (50 / 60);
            
            return (
              <ActivityBlock
                key={activityIndex}
                activity={activity}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  minHeight: '24px'
                }}
                colorClass={getActivityColor(activity.activity_type)}
                icon={getActivityIcon(activity.activity_type)}
                onDelete={() => onDeleteActivity(activity.id)}
              />
            );
          })}
      </div>
    </div>
  );

  return isMobile ? (
    <div className="flex">
      <div className="w-16 flex-shrink-0">
        {hours.map((hour) => (
          <div key={hour} className="h-20 border-b border-gray-200 text-sm text-gray-500 text-center">
            {hour}
          </div>
        ))}
      </div>
      {renderDayView(selectedDay)}
    </div>
  ) : (
    <div className="flex print:scale-100 print:transform-none">
      <div className="w-16 flex-shrink-0 print:w-12">
        {hours.map((hour) => (
          <div key={hour} className="h-20 border-b border-gray-200 text-sm text-gray-500 text-center print:h-16 print:text-xs">
            {hour}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 gap-1">
        {days.map((day, dayIndex) => renderDayView(dayIndex))}
      </div>
    </div>
  );
};