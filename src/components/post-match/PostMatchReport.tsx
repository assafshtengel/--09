import { useParams } from "react-router-dom";

export const PostMatchReport = () => {
  const { matchId } = useParams();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">דוח לאחר משחק</h1>
      {/* Placeholder - will be implemented later */}
    </div>
  );
};