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
      className={`${colorClass} absolute w-[95%] p-2 rounded-md border text-sm overflow-hidden transition-all hover:shadow-md group`}
      style={style}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1 font-medium">
        <span>{icon}</span>
        <span className="truncate">{activity.title}</span>
      </div>
      <div className="text-xs text-gray-600 mt-0.5 print:text-[10px]">
        {activity.start_time} - {activity.end_time}
      </div>
    </div>
  );
};