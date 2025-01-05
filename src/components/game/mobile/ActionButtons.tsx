import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  actionId: string;
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
}

export const ActionButtons = ({ actionId, onLog }: ActionButtonsProps) => {
  return (
    <div className="flex gap-2 justify-center">
      <Button
        size="lg"
        variant="outline"
        className="w-12 h-12 rounded-full border-green-500 hover:bg-green-500 hover:text-white"
        onClick={() => onLog(actionId, "success")}
      >
        ✓
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="w-12 h-12 rounded-full border-red-500 hover:bg-red-500 hover:text-white"
        onClick={() => onLog(actionId, "failure")}
      >
        ✗
      </Button>
    </div>
  );
};