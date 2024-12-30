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

export const ScheduleGrid = ({
  activities,
  days,
  hours,
  isMobile,
  selectedDay,
  onDeleteActivity
}: ScheduleGridProps) => {
  const [activeSection, setActiveSection] = useState<'first' | 'second'>('first');
  
  const firstHalf = days.slice(0, 4); // Sunday to Wednesday
  const secondHalf = days.slice(4); // Thursday to Saturday
  
  const currentDays = activeSection === 'first' ? firstHalf : secondHalf;

  const renderTimeColumn = () => (
    <div className="sticky left-0 bg-background z-10">
      <div className="h-12 border-b" /> {/* Header spacer */}
      {hours.map((hour) => (
        <div key={hour} className="h-16 border-b px-2 text-sm text-muted-foreground">
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
        <div key={day} className="flex-1 min-w-[200px]">
          <div className="h-12 border-b px-2 font-medium text-center">{day}</div>
          <div className="relative">
            {hours.map((hour, hourIndex) => (
              <div key={hour} className="h-16 border-b border-r" />
            ))}
            {dayActivities.map((activity) => (
              <ActivityBlock
                key={activity.id}
                activity={activity}
                onDelete={() => onDeleteActivity(activity.id)}
              />
            ))}
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
        <div className="relative">
          {renderTimeColumn()}
          <div className="flex-1 min-w-[200px]">
            <div className="h-12 border-b px-2 font-medium text-center">
              {days[selectedDay]}
            </div>
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b border-r" />
              ))}
              {dayActivities.map((activity) => (
                <ActivityBlock
                  key={activity.id}
                  activity={activity}
                  onDelete={() => onDeleteActivity(activity.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <Button
          variant={activeSection === 'first' ? 'default' : 'outline'}
          onClick={() => setActiveSection('first')}
          size="sm"
        >
          ראשון - רביעי
        </Button>
        <Button
          variant={activeSection === 'second' ? 'default' : 'outline'}
          onClick={() => setActiveSection('second')}
          size="sm"
        >
          חמישי - שבת
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