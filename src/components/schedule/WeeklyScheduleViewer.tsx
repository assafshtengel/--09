import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Printer, Camera } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface Activity {
  day_of_week: number;
  start_time: string;
  end_time: string | number;
  activity_type: string;
  title?: string;
}

interface WeeklyScheduleViewerProps {
  activities: Activity[];
}

export const WeeklyScheduleViewer = ({ activities }: WeeklyScheduleViewerProps) => {
  const isMobile = useIsMobile();
  const [selectedDay, setSelectedDay] = useState(0);
  
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const hours = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

  const formatTime = (time: string | number): string => {
    if (typeof time === 'string') return time;
    const date = new Date(time);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const handlePrint = () => {
    window.print();
    toast.success("המערכת נשלחה להדפסה");
  };

  const handleScreenshot = async () => {
    try {
      const element = document.getElementById('weekly-schedule');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `weekly-schedule-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success("צילום המסך נשמר בהצלחה");
      }
    } catch (error) {
      toast.error("שגיאה בשמירת צילום המסך");
    }
  };

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
                  {startTime} - {endTime}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h3 className="text-xl font-bold">תצוגת מערכת שבועית</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 ml-2" />
            הדפס
          </Button>
          <Button variant="outline" size="sm" onClick={handleScreenshot}>
            <Camera className="h-4 w-4 ml-2" />
            צלם מסך
          </Button>
        </div>
      </div>
      
      <div id="weekly-schedule" className="print:p-4">
        {isMobile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 print:hidden">
              <Button variant="outline" size="icon" onClick={() => setSelectedDay((prev) => (prev > 0 ? prev - 1 : 6))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h4 className="text-lg font-semibold">{days[selectedDay]}</h4>
              <Button variant="outline" size="icon" onClick={() => setSelectedDay((prev) => (prev < 6 ? prev + 1 : 0))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            
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
              {days.map((day, dayIndex) => (
                <div key={dayIndex} className="min-w-[120px] print:min-w-[100px]">
                  <div className="font-bold mb-2 text-center bg-gray-50 p-2 rounded print:text-sm print:p-1">
                    {day}
                  </div>
                  <div className="relative h-[900px] border-r border-gray-100 print:h-[720px]">
                    {activities
                      .filter((activity) => activity.day_of_week === dayIndex)
                      .map((activity, activityIndex) => {
                        const startTime = formatTime(activity.start_time);
                        const endTime = formatTime(activity.end_time);
                        
                        const startHour = parseInt(startTime.split(':')[0]);
                        const startMinute = parseInt(startTime.split(':')[1]);
                        const endHour = parseInt(endTime.split(':')[0]);
                        const endMinute = parseInt(endTime.split(':')[1]);
                        
                        const top = ((startHour - 6) * 60 + startMinute) * (40 / 60);
                        const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (40 / 60);
                        
                        return (
                          <div
                            key={activityIndex}
                            className={`${getActivityColor(activity.activity_type)} absolute w-[95%] p-2 rounded-md border text-sm overflow-hidden transition-all hover:shadow-md print:text-xs print:p-1`}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              minHeight: '20px'
                            }}
                          >
                            <div className="flex items-center gap-1 font-medium print:text-xs">
                              <span>{getActivityIcon(activity.activity_type)}</span>
                              <span className="truncate">{activity.title}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5 print:text-[10px]">
                              {startTime} - {endTime}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          #weekly-schedule {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 1cm;
            background: white;
            box-shadow: none;
          }
          .Card {
            box-shadow: none;
            border: none;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-blue-100 { background-color: #dbeafe !important; }
          .bg-green-100 { background-color: #dcfce7 !important; }
          .bg-red-100 { background-color: #fee2e2 !important; }
          .bg-purple-100 { background-color: #f3e8ff !important; }
          .bg-yellow-100 { background-color: #fef9c3 !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-orange-100 { background-color: #ffedd5 !important; }
        }
      `}</style>
    </Card>
  );
};