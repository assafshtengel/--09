import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonProps {
  actionId: string;
  actionName: string;
  result: "success" | "failure";
  onClick: () => void;
  className?: string;
}

export const ActionButton = ({ actionId, actionName, result, onClick, className }: ActionButtonProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    // Show toast notification
    toast({
      title: result === "success" ? `${actionName} - הצלחה` : `${actionName} - כישלון`,
      description: result === "success" ? "✓ הפעולה נרשמה בהצלחה" : "✗ הפעולה נרשמה ככישלון",
      variant: result === "success" ? "default" : "destructive",
      duration: 2000,
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