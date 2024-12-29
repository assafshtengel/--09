import { ActionButton } from "../ActionButton";

interface ActionButtonsProps {
  actionId: string;
  onLog: (actionId: string, result: "success" | "failure", note?: string) => void;
}

export const ActionButtons = ({ actionId, onLog }: ActionButtonsProps) => {
  return (
    <div className="flex gap-4 justify-center">
      <ActionButton
        actionId={actionId}
        result="success"
        onClick={() => onLog(actionId, "success")}
        className="w-16 h-16 md:w-12 md:h-12"
      />
      <ActionButton
        actionId={actionId}
        result="failure"
        onClick={() => onLog(actionId, "failure")}
        className="w-16 h-16 md:w-12 md:h-12"
      />
    </div>
  );
};