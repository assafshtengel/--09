import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityBlockProps {
  activity: {
    activity_type: string;
    title?: string;
    start_time: string;
    end_time: string;
  };
  style: React.CSSProperties;
  colorClass: string;
  icon: string;
  onDelete: () => void;
}

export const ActivityBlock = ({ activity, style, colorClass, icon, onDelete }: ActivityBlockProps) => {
  return (
    <div
      className={`${colorClass} absolute w-[95%] p-2 rounded-md border overflow-hidden transition-all hover:shadow-md group print:hover:shadow-none`}
      style={style}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100 h-5 w-5 print:hidden"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="flex items-start gap-1">
        <span className="text-base print:text-xs shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm print:text-xs break-words hyphens-auto">
            {activity.title}
          </div>
          <div className="text-xs text-gray-600 mt-0.5 print:text-[8px] whitespace-nowrap">
            {activity.start_time} - {activity.end_time}
          </div>
        </div>
      </div>
    </div>
  );
};