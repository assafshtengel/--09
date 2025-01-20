import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ActivityManageModal } from "./ActivityManageModal";

interface ActivityBlockProps {
  activity: {
    id?: string;
    activity_type: string;
    title?: string;
    start_time: string;
    end_time: string;
  };
  style: React.CSSProperties;
  colorClass: string;
  icon: string;
  onDelete: () => void;
  onEdit?: (updatedActivity: { title?: string; start_time: string; end_time: string }) => void;
}

export const ActivityBlock = ({ 
  activity, 
  style, 
  colorClass, 
  icon, 
  onDelete,
  onEdit 
}: ActivityBlockProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div
        className={`${colorClass} absolute w-[92%] p-1 rounded-md border overflow-hidden transition-all hover:shadow-md group print:hover:shadow-none cursor-pointer`}
        style={style}
        onClick={handleClick}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100 h-4 w-4 print:hidden"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-2 w-2" />
        </Button>
        <div className="flex items-start gap-0.5">
          <span className="text-sm print:text-xs shrink-0">{icon}</span>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-xs print:text-[10px] break-words hyphens-auto">
              {activity.title}
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5 print:text-[8px] whitespace-nowrap">
              {activity.start_time} - {activity.end_time}
            </div>
          </div>
        </div>
      </div>

      <ActivityManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={activity}
        onDelete={onDelete}
        onEdit={onEdit || (() => {})}
      />
    </>
  );
};