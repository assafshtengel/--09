import { useParams } from "react-router-dom";

export default function GameSummary() {
  const { id } = useParams();
  
  return (
    <div>
      <h1>Game Summary</h1>
      <p>Game ID: {id}</p>
    </div>
  );
}