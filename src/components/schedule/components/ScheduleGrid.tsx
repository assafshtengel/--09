import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ActivityBlock } from "./ActivityBlock";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="sticky right-0 bg-background z-10 min-w-[45px] max-w-[45px] print:min-w-[45px] print:max-w-[45px]">
      <div className="h-12 border-b print:h-10" />
      {hours.map((hour) => (
        <div key={hour} className="h-16 border-b px-2 text-xs text-muted-foreground print:h-14 print:text-[8px] print:px-1">
          {hour}
        </div>
      ))}
    </div>
  );

  const handleEditActivity = async (activityId: string, updatedActivity: { title?: string; start_time: string; end_time: string }) => {
    try {
      const { error } = await supabase
        .from('schedule_activities')
        .update({
          title: updatedActivity.title,
          start_time: updatedActivity.start_time,
          end_time: updatedActivity.end_time
        })
        .eq('id', activityId);

      if (error) throw error;
      
      // Refresh the activities list (you'll need to implement this)
      // This could be done through a callback prop or by refetching the data
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const renderDayColumns = () => (
    currentDays.map((day, dayIndex) => {
      const actualDayIndex = activeSection === 'first' ? dayIndex : dayIndex + 4;
      const dayActivities = activities.filter(
        (activity) => activity.day_of_week === actualDayIndex
      );

      return (
        <div key={day} className={cn(
          "flex-1 border-r",
          isMobile ? "min-w-[60px] max-w-[60px]" : "min-w-[90px] max-w-[90px]",
          "print:min-w-[80px] print:max-w-[80px]"
        )}>
          <div className="h-12 border-b px-1 font-medium text-center text-sm print:h-10 print:text-xs break-words hyphens-auto">
            {day}
          </div>
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b print:h-14" />
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
                  onEdit={(updatedActivity) => handleEditActivity(activity.id!, updatedActivity)}
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
          <div className={cn(
            "flex-1 border-r",
            "min-w-[60px] max-w-[60px]"
          )}>
            <div className="h-12 border-b px-1 font-medium text-center text-sm break-words hyphens-auto">
              {days[selectedDay]}
            </div>
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b" />
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
                    onEdit={(updatedActivity) => handleEditActivity(activity.id!, updatedActivity)}
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
        <div className="flex print:scale-95 print:transform-origin-top-right">
          {renderTimeColumn()}
          <div className="flex flex-1 overflow-x-auto print:overflow-visible">
            {renderDayColumns()}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};