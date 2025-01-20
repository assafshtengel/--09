import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ActivityBlock } from "./ActivityBlock";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  onDeleteActivity: (activityId?: string) => void;
}

const getActivityStyle = (activity: Activity) => {
  const startHour = parseInt(activity.start_time.split(':')[0]);
  const startMinute = parseInt(activity.start_time.split(':')[1]);
  const endHour = parseInt(activity.end_time.split(':')[0]);
  const endMinute = parseInt(activity.end_time.split(':')[1]);
  
  const top = ((startHour - 6) * 64) + (startMinute / 60 * 64);
  const height = ((endHour - startHour) * 64) + ((endMinute - startMinute) / 60 * 64);
  
  return {
    top: `${top}px`,
    height: `${height}px`
  };
};

const getActivityProps = (activity: Activity) => {
  switch (activity.activity_type) {
    case 'school':
      return {
        colorClass: 'bg-blue-100',
        icon: '🏫'
      };
    case 'team_training':
      return {
        colorClass: 'bg-green-100',
        icon: '⚽'
      };
    case 'personal_training':
      return {
        colorClass: 'bg-purple-100',
        icon: '🏃'
      };
    case 'sleep':
      return {
        colorClass: 'bg-gray-100',
        icon: '😴'
      };
    default:
      return {
        colorClass: 'bg-yellow-100',
        icon: '📅'
      };
  }
};

export const ScheduleGrid = ({
  activities,
  days,
  hours,
  isMobile,
  selectedDay,
  onDeleteActivity
}: ScheduleGridProps) => {
  const [activeSection, setActiveSection] = useState<'first' | 'second'>('first');
  
  const firstHalf = days.slice(0, 4);
  const secondHalf = days.slice(4);
  
  const currentDays = activeSection === 'first' ? firstHalf : secondHalf;

  const renderTimeColumn = () => (
    <div className="sticky right-0 bg-background z-10 min-w-[50px] max-w-[50px] print:min-w-[40px] print:max-w-[40px]">
      <div className="h-10 border-b print:h-8" />
      {hours.map((hour) => (
        <div key={hour} className="h-14 border-b px-1 text-xs text-muted-foreground print:h-12 print:text-[10px]">
          {hour}
        </div>
      ))}
    </div>
  );

  const renderDayColumns = () => (
    currentDays.map((day, dayIndex) => {
      const actualDayIndex = activeSection === 'first' ? dayIndex : dayIndex + 4;
      const dayActivities = activities.filter(
        (activity) => activity.day_of_week === actualDayIndex
      );

      return (
        <div key={day} className="flex-1 min-w-[70px] max-w-[70px] print:min-w-[60px] print:max-w-[60px]">
          <div className="h-10 border-b px-1 font-medium text-center text-sm truncate print:h-8 print:text-xs">
            {day}
          </div>
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="h-14 border-b border-r print:h-12" />
            ))}
            {dayActivities.map((activity) => {
              const { colorClass, icon } = getActivityProps(activity);
              return (
                <ActivityBlock
                  key={`${activity.id}-${actualDayIndex}`}
                  activity={activity}
                  style={getActivityStyle(activity)}
                  colorClass={colorClass}
                  icon={icon}
                  onDelete={() => onDeleteActivity(activity.id)}
                />
              );
            })}
          </div>
        </div>
      );
    })
  );

  if (isMobile) {
    const dayActivities = activities.filter(
      (activity) => activity.day_of_week === selectedDay
    );

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="flex">
          {renderTimeColumn()}
          <div className="flex-1 min-w-[70px] max-w-[70px]">
            <div className="h-10 border-b px-1 font-medium text-center text-sm">
              {days[selectedDay]}
            </div>
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="h-14 border-b border-r" />
              ))}
              {dayActivities.map((activity) => {
                const { colorClass, icon } = getActivityProps(activity);
                return (
                  <ActivityBlock
                    key={`${activity.id}-${selectedDay}`}
                    activity={activity}
                    style={getActivityStyle(activity)}
                    colorClass={colorClass}
                    icon={icon}
                    onDelete={() => onDeleteActivity(activity.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveSection('first')}
          className={cn(
            "gap-2",
            activeSection === 'first' && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <ChevronRight className="h-4 w-4" />
          ראשון - רביעי
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveSection('second')}
          className={cn(
            "gap-2",
            activeSection === 'second' && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          חמישי - שבת
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="border rounded-lg print:border-none">
        <div className="flex print:scale-90 print:transform-origin-top-right">
          {renderTimeColumn()}
          <div className="flex flex-1 overflow-x-auto print:overflow-visible">
            {renderDayColumns()}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};