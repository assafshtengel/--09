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
      className={`${colorClass} absolute w-[95%] p-1.5 rounded-md border text-xs overflow-hidden transition-all hover:shadow-md group print:hover:shadow-none print:text-[9px] print:p-1`}
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
      <div className="flex items-center gap-0.5 font-medium">
        <span className="print:text-[8px]">{icon}</span>
        <span className="truncate">{activity.title}</span>
      </div>
      <div className="text-[10px] text-gray-600 mt-0.5 print:text-[8px]">
        {activity.start_time} - {activity.end_time}
      </div>
    </div>
  );
};