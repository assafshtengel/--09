import { useState } from "react";
import { PlayerForm, PlayerFormData } from "@/components/PlayerForm";
import { ActionSelector } from "@/components/ActionSelector";

const Player = () => {
  const [phase, setPhase] = useState<"form" | "actions">("form");
  const [playerData, setPlayerData] = useState<PlayerFormData | null>(null);

  const handleFormSubmit = (data: PlayerFormData) => {
    console.log("Form submitted:", data);
    setPlayerData(data);
    setPhase("actions");
  };

  const handleActionSubmit = (actions: any[]) => {
    console.log("Selected actions:", actions);
    // Here we'll later add the logic to move to the game tracking phase
  };

  return (
    <div className="container mx-auto py-8">
      {phase === "form" ? (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">פרטי משחק</h1>
          <PlayerForm onSubmit={handleFormSubmit} />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">בחירת פעולות</h1>
          <ActionSelector 
            position={playerData?.position || ""}
            onSubmit={handleActionSubmit}
          />
        </>
      )}
    </div>
  );
};

export default Player;