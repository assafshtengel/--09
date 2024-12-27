import { useState } from "react";
import { PlayerForm, PlayerFormData } from "@/components/PlayerForm";
import { ActionSelector } from "@/components/ActionSelector";
import { GameTracker } from "@/components/GameTracker";
import type { Action } from "@/components/ActionSelector";

type Phase = "form" | "actions" | "game";

const Player = () => {
  const [phase, setPhase] = useState<Phase>("form");
  const [playerData, setPlayerData] = useState<PlayerFormData | null>(null);
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);

  const handleFormSubmit = (data: PlayerFormData) => {
    console.log("Form submitted:", data);
    setPlayerData(data);
    setPhase("actions");
  };

  const handleActionSubmit = (actions: Action[]) => {
    console.log("Selected actions:", actions);
    setSelectedActions(actions);
    setPhase("game");
  };

  return (
    <div className="container mx-auto py-8">
      {phase === "form" ? (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">פרטי משחק</h1>
          <PlayerForm onSubmit={handleFormSubmit} />
        </>
      ) : phase === "actions" ? (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">בחירת פעולות</h1>
          <ActionSelector 
            position={playerData?.position || ""}
            onSubmit={handleActionSubmit}
          />
        </>
      ) : (
        <GameTracker actions={selectedActions} />
      )}
    </div>
  );
};

export default Player;