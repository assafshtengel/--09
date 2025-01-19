import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ActivityBlock } from "./ActivityBlock";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        colorClass: 'bg-blue-100/80 hover:bg-blue-100',
        icon: '🏫'
      };
    case 'team_training':
      return {
        colorClass: 'bg-green-100/80 hover:bg-green-100',
        icon: '⚽'
      };
    case 'personal_training':
      return {
        colorClass: 'bg-purple-100/80 hover:bg-purple-100',
        icon: '🏃'
      };
    case 'sleep':
      return {
        colorClass: 'bg-gray-100/80 hover:bg-gray-100',
        icon: '😴'
      };
    default:
      return {
        colorClass: 'bg-yellow-100/80 hover:bg-yellow-100',
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
  console.log("Received activities:", activities); // Debug log

  const renderTimeColumn = () => (
    <div className="sticky right-0 bg-background z-10 border-l">
      <div className="h-12 border-b" />
      {hours.map((hour) => (
        <div key={hour} className="h-16 border-b px-2 text-sm text-muted-foreground">
          {hour}
        </div>
      ))}
    </div>
  );

  const renderDayColumn = (day: string, dayIndex: number) => {
    // Filter activities for the current day
    const dayActivities = isMobile 
      ? activities.filter(activity => activity.day_of_week === selectedDay)
      : activities.filter(activity => activity.day_of_week === dayIndex);

    console.log(`Activities for day ${dayIndex}:`, dayActivities); // Debug log

    const isWeekend = dayIndex >= 5;

    return (
      <div key={day} className={cn(
        "flex-1 min-w-[90px] max-w-[120px] transition-colors",
        isWeekend && "bg-gray-50/50"
      )}>
        <div className="h-12 border-b px-2 font-medium text-center sticky top-0 bg-background">
          {day}
        </div>
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-b border-r" />
          ))}
          {dayActivities.map((activity) => {
            const { colorClass, icon } = getActivityProps(activity);
            return (
              <ActivityBlock
                key={`${activity.day_of_week}-${activity.start_time}-${activity.activity_type}-${activity.title}`}
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
  };

  if (isMobile) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="relative">
          {renderTimeColumn()}
          {renderDayColumn(days[selectedDay], selectedDay)}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="border rounded-lg">
      <div className="flex min-w-[720px]">
        {renderTimeColumn()}
        {days.map((day, index) => renderDayColumn(day, index))}
      </div>
    </ScrollArea>
  );
};