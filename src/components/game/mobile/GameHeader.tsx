import { GameTimer } from "../GameTimer";
import { GameStats } from "../GameStats";
import { Action } from "@/components/ActionSelector";

interface GameHeaderProps {
  isTimerRunning: boolean;
  minute: number;
  onMinuteChange: (minute: number) => void;
  actions: Action[];
  actionLogs: Array<{ actionId: string; result: "success" | "failure" }>;
}

export const GameHeader = ({
  isTimerRunning,
  minute,
  onMinuteChange,
  actions,
  actionLogs
}: GameHeaderProps) => {
  return (
    <div className="sticky top-0 bg-white border-b z-10 p-4 space-y-4">
      <GameTimer
        isRunning={isTimerRunning}
        minute={minute}
        onMinuteChange={onMinuteChange}
      />
      <GameStats actions={actions} actionLogs={actionLogs} />
    </div>
  );
};