import { useParams } from "react-router-dom";

export default function Match() {
  const { id } = useParams();
  
  return (
    <div>
      <h1>Match Details</h1>
      <p>Match ID: {id}</p>
    </div>
  );
}