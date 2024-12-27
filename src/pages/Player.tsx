import { useState } from "react";
import { PlayerForm, PlayerFormData } from "@/components/PlayerForm";

const Player = () => {
  const handleSubmit = (data: PlayerFormData) => {
    console.log("Form submitted:", data);
    // Here we'll later add the logic to move to the action selection phase
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">פרטי משחק</h1>
      <PlayerForm onSubmit={handleSubmit} />
    </div>
  );
};

export default Player;