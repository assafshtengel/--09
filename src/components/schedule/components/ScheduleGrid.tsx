import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityBlock } from "./ActivityBlock";
import { supabase } from "@/integrations/supabase/client";
import { useMediaQuery } from "@/hooks/use-mobile";

interface Activity {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  title?: string;
  activity_type: 'school' | 'training' | 'match' | 'social' | 'exam' | 'meal';
}

interface ScheduleGridProps {
  days: string[];
  hours: string[];
  activities: Activity[];
  selectedDay: number;
  onDeleteActivity: (id: string) => void;
  onActivityUpdated?: () => void; // New callback prop
}

export const ScheduleGrid = ({
  days,
  hours,
  activities,
  selectedDay,
  onDeleteActivity,
  onActivityUpdated
}: ScheduleGridProps) => {
  const [activeSection, setActiveSection] = useState<'first' | 'second'>('first');
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // For mobile, show 3 days at a time
  const getMobileDays = () => {
    const startIdx = Math.floor(selectedDay / 3) * 3;
    return days.slice(startIdx, startIdx + 3);
  };
  
  const firstHalf = days.slice(0, 4);
  const secondHalf = days.slice(4);
  const currentDays = activeSection === 'first' ? firstHalf : secondHalf;

  const getActivityStyle = (activity: Activity) => {
    const startHour = parseInt(activity.start_time.split(':')[0]);
    const startMinute = parseInt(activity.start_time.split(':')[1]);
    const endHour = parseInt(activity.end_time.split(':')[0]);
    const endMinute = parseInt(activity.end_time.split(':')[1]);
    
    const top = (startHour - 6) * 64 + (startMinute / 60) * 64;
    const height = ((endHour - startHour) * 64) + ((endMinute - startMinute) / 60) * 64;
    
    return {
      top: `${top}px`,
      height: `${height}px`
    };
  };

  const getActivityProps = (activity: Activity) => {
    const typeToProps = {
      school: { colorClass: "bg-blue-100 border-blue-300", icon: "🏫" },
      training: { colorClass: "bg-green-100 border-green-300", icon: "⚽" },
      match: { colorClass: "bg-purple-100 border-purple-300", icon: "🏆" },
      social: { colorClass: "bg-yellow-100 border-yellow-300", icon: "👥" },
      exam: { colorClass: "bg-red-100 border-red-300", icon: "📝" },
      meal: { colorClass: "bg-orange-100 border-orange-300", icon: "🍽️" }
    };
    
    return typeToProps[activity.activity_type] || { colorClass: "bg-gray-100", icon: "📅" };
  };

  const handleEditActivity = async (activityId: string, updatedActivity: Partial<Activity>) => {
    try {
      const { error } = await supabase
        .from('schedule_activities')
        .update(updatedActivity)
        .eq('id', activityId);
      
      if (error) throw error;
      
      // Call the callback to refresh activities
      if (onActivityUpdated) {
        onActivityUpdated();
      }
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const renderTimeColumn = () => (
    <div className="min-w-[60px] border-r">
      <div className="h-12 border-b" />
      <div className="relative">
        {hours.map((hour) => (
          <div key={hour} className="h-16 border-b">
            <span className="absolute -translate-y-1/2 right-2 text-sm text-gray-500">
              {hour}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDayColumns = (daysToRender: string[]) => (
    daysToRender.map((day, dayIndex) => {
      const actualDayIndex = isMobile 
        ? (Math.floor(selectedDay / 3) * 3) + dayIndex
        : activeSection === 'first' ? dayIndex : dayIndex + 4;
        
      const dayActivities = activities.filter(
        (activity) => activity.day_of_week === actualDayIndex
      );

      return (
        <div key={`${day}-${actualDayIndex}`} className={cn(
          "flex-1 border-r",
          isMobile ? "min-w-[60px] max-w-[60px]" : "min-w-[90px] max-w-[90px]",
          "print:min-w-[80px] print:max-w-[80px]"
        )}>
          <div className="h-12 border-b px-1 font-medium text-center text-sm break-words hyphens-auto">
            {day}
          </div>
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b" />
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
                  onDelete={() => onDeleteActivity(activity.id!)}
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
    const mobileDays = getMobileDays();
    
    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="flex">
          {renderTimeColumn()}
          <div className="flex flex-1 overflow-x-auto">
            {renderDayColumns(mobileDays)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 print:hidden">
        <button
          onClick={() => setActiveSection('first')}
          className={cn(
            "px-4 py-2 rounded text-sm",
            activeSection === 'first'
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          ימים ראשונים
        </button>
        <button
          onClick={() => setActiveSection('second')}
          className={cn(
            "px-4 py-2 rounded text-sm",
            activeSection === 'second'
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          ימים אחרונים
        </button>
      </div>
      
      <ScrollArea className="border rounded-lg print:border-none">
        <div className="flex print:scale-95 print:transform-origin-top-right">
          {renderTimeColumn()}
          <div className="flex flex-1 overflow-x-auto print:overflow-visible">
            {renderDayColumns(currentDays)}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};