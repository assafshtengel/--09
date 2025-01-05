import { ReactNode } from "react";
import { GameHeader } from "./GameHeader";
import { GameControls } from "./GameControls";
import { GamePhase } from "@/types/game";
import { Action } from "@/components/ActionSelector";

interface GameLayoutProps {
  children: ReactNode;
  gamePhase: GamePhase;
  isTimerRunning: boolean;
  minute: number;
  onMinuteChange: (minute: number) => void;
  actions: Action[];
  actionLogs: Array<{ actionId: string; result: "success" | "failure" }>;
  onStartMatch: () => void;
  onEndHalf: () => void;
  onStartSecondHalf: () => void;
  onEndMatch: () => void;
}

export const GameLayout = ({
  children,
  gamePhase,
  isTimerRunning,
  minute,
  onMinuteChange,
  actions,
  actionLogs,
  onStartMatch,
  onEndHalf,
  onStartSecondHalf,
  onEndMatch
}: GameLayoutProps) => {
  return (
    <div className="fixed inset-0 flex flex-col bg-gray-50">
      {gamePhase !== "preview" && (
        <GameHeader
          isTimerRunning={isTimerRunning}
          minute={minute}
          onMinuteChange={onMinuteChange}
          actions={actions}
          actionLogs={actionLogs}
        />
      )}
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <GameControls
        gamePhase={gamePhase}
        onStartMatch={onStartMatch}
        onEndHalf={onEndHalf}
        onStartSecondHalf={onStartSecondHalf}
        onEndMatch={onEndMatch}
      />
    </div>
  );
};