import { Button } from "@/components/ui/button";
import { Printer, Camera, Copy } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";

interface ScheduleHeaderProps {
  onPrint: () => void;
  onCopyLastWeek: () => void;
}

export const ScheduleHeader = ({ onPrint, onCopyLastWeek }: ScheduleHeaderProps) => {
  const handleScreenshot = async () => {
    try {
      const element = document.getElementById('weekly-schedule');
      if (element) {
        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `weekly-schedule-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success("צילום המסך נשמר בהצלחה");
      }
    } catch (error) {
      toast.error("שגיאה בשמירת צילום המסך");
    }
  };

  return (
    <div className="flex justify-between items-center mb-4 print:hidden">
      <h3 className="text-xl font-bold">תצוגת מערכת שבועית</h3>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="h-4 w-4 ml-2" />
          הדפס
        </Button>
        <Button variant="outline" size="sm" onClick={handleScreenshot}>
          <Camera className="h-4 w-4 ml-2" />
          צלם מסך
        </Button>
        <Button variant="outline" size="sm" onClick={onCopyLastWeek}>
          <Copy className="h-4 w-4 ml-2" />
          העתק שבוע קודם
        </Button>
      </div>
    </div>
  );
};