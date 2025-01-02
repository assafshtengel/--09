import { Navigation } from "@/components/Navigation";
import { GameSelection } from "@/components/game/GameSelection";
import { GameTracker } from "@/components/GameTracker";
import { useParams } from "react-router-dom";

export default function Game() {
  const { id } = useParams();

  return (
    <div>
      <Navigation />
      {id ? <GameTracker /> : <GameSelection />}
    </div>
  );
}