import { useState } from "react";
import { ActionButton } from "./ActionButton";
import { Input } from "@/components/ui/input";
import { Action } from "@/components/ActionSelector";

interface ActionItemProps {
  action: Action;
  stats: { success: number; total: number };
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
}

export const ActionItem = ({ action, stats, onLog }: ActionItemProps) => {
  const [note, setNote] = useState("");

  const handleAction = (result: "success" | "failure") => {
    onLog(action.id, result, note || undefined);
    setNote("");
  };

  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{stats.success}/{stats.total}</span>
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
    </div>
  );
};