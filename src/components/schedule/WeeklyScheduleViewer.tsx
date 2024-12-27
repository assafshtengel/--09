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
      default:
        return "bg-gray-100";
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-xl font-bold mb-4 text-right">תצוגת מערכת שבועית</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={day} className="text-center">
            <div className="font-bold mb-2">{day}</div>
            <div className="space-y-2">
              {activities
                .filter((activity) => activity.day_of_week === index)
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((activity, activityIndex) => (
                  <div
                    key={activityIndex}
                    className={`${getActivityColor(activity.activity_type)} p-2 rounded text-sm`}
                  >
                    <div>{activity.title}</div>
                    <div>
                      {activity.start_time} - {activity.end_time}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};