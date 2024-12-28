import { useEffect } from "react";

interface GameTimerProps {
  isRunning: boolean;
  minute: number;
  onMinuteChange: (minute: number) => void;
}

export const GameTimer = ({ isRunning, minute, onMinuteChange }: GameTimerProps) => {
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      onMinuteChange(minute + 1);
    }, 60000); // Update every minute (60000ms)

    return () => clearInterval(interval);
  }, [isRunning, minute, onMinuteChange]);

  return (
    <div className="fixed top-4 left-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg z-50">
      דקה: {minute}
    </div>
  );
};