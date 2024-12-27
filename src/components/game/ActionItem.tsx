import { useState } from "react";
import { ActionButton } from "./ActionButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Action } from "@/components/ActionSelector";

interface ActionItemProps {
  action: Action;
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
}

export const ActionItem = ({ action, onLog }: ActionItemProps) => {
  const [note, setNote] = useState("");
  const [showUndo, setShowUndo] = useState<"success" | "failure" | null>(null);

  const handleAction = (result: "success" | "failure") => {
    onLog(action.id, result, note || undefined);
    setNote("");
    
    // Show undo button for 3 seconds
    setShowUndo(result);
    setTimeout(() => setShowUndo(null), 3000);
  };

  const handleUndo = () => {
    // Here you would implement the undo logic
    setShowUndo(null);
    // You might want to call a parent function to remove the last action
  };

  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <ActionButton
            actionId={action.id}
            result="success"
            onClick={() => handleAction("success")}
          />
          <ActionButton
            actionId={action.id}
            result="failure"
            onClick={() => handleAction("failure")}
          />
        </div>
        <span className="font-medium">{action.name}</span>
      </div>
      
      <div className="mt-2">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="הוסף הערה..."
          className="text-right"
        />
      </div>

      {showUndo && (
        <div className="mt-2 text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="text-sm"
          >
            בטל פעולה אחרונה
          </Button>
        </div>
      )}
    </div>
  );
};