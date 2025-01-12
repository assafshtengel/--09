import { GameSelection } from "@/components/game/GameSelection";
import { Navigation } from "@/components/Navigation";

const GameSelectionPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-right">בחירת משחק למעקב</h1>
        <GameSelection />
      </div>
    </div>
  );
};

export default GameSelectionPage;