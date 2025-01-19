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
  const [activeSection, setActiveSection] = useState<'first' | 'second' | 'third'>('first');
  
  // Split days into three sections
  const firstSection = days.slice(0, 2);    // Sunday-Monday
  const secondSection = days.slice(2, 4);   // Tuesday-Wednesday
  const thirdSection = days.slice(4);       // Thursday-Saturday

  const getCurrentDays = () => {
    switch (activeSection) {
      case 'first':
        return firstSection;
      case 'second':
        return secondSection;
      case 'third':
        return thirdSection;
      default:
        return firstSection;
    }
  };

  const getActualDayIndex = (dayIndex: number) => {
    switch (activeSection) {
      case 'first':
        return dayIndex;
      case 'second':
        return dayIndex + 2;
      case 'third':
        return dayIndex + 4;
      default:
        return dayIndex;
    }
  };

  const renderTimeColumn = () => (
    <div className="sticky right-0 bg-background z-10">
      <div className="h-12 border-b" /> {/* Header spacer */}
      {hours.map((hour) => (
        <div key={hour} className="h-16 border-b px-2 text-sm text-muted-foreground">
          {hour}
        </div>
      ))}
    </div>
  );

  const renderDayColumns = () => {
    const currentDays = getCurrentDays();
    
    return currentDays.map((day, dayIndex) => {
      const actualDayIndex = getActualDayIndex(dayIndex);
      const dayActivities = activities.filter(
        (activity) => activity.day_of_week === actualDayIndex
      );

      return (
        <div key={day} className="flex-1 min-w-[120px] max-w-[120px]">
          <div className="h-12 border-b px-2 font-medium text-center">{day}</div>
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b border-r" />
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
    });
  };

  if (isMobile) {
    const dayActivities = activities.filter(
      (activity) => activity.day_of_week === selectedDay
    );

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="relative">
          {renderTimeColumn()}
          <div className="flex-1 min-w-[120px] max-w-[120px]">
            <div className="h-12 border-b px-2 font-medium text-center">
              {days[selectedDay]}
            </div>
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b border-r" />
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
          ראשון - שני
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
          שלישי - רביעי
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveSection('third')}
          className={cn(
            "gap-2",
            activeSection === 'third' && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          חמישי - שבת
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="border rounded-lg">
        <div className="flex">
          {renderTimeColumn()}
          {renderDayColumns()}
        </div>
      </ScrollArea>
    </div>
  );
};