import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ActionButtonProps {
  actionId: string;
  result: "success" | "failure";
  onClick: () => void;
  className?: string;
}

export const ActionButton = ({ actionId, result, onClick, className }: ActionButtonProps) => {
  const handleClick = () => {
    // Show toast notification for 1.2 seconds
    toast({
      title: result === "success" ? "פעולה הצליחה" : "פעולה נכשלה",
      className: result === "success" ? "bg-green-500" : "bg-red-500",
      duration: 1200, // Changed from 1000 to 1200 milliseconds
    });
    
    // Trigger vibration on mobile if supported
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    onClick();
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className={`${
        result === "success"
          ? "border-green-500 hover:bg-green-500 hover:text-white"
          : "border-red-500 hover:bg-red-500 hover:text-white"
      } ${className || ""}`}
      onClick={handleClick}
    >
      {result === "success" ? "✓" : "✗"}
    </Button>
  );
};