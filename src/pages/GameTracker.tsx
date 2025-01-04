import { useParams } from "react-router-dom";

export const GameTracker = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-right">מעקב משחק</h1>
      <p className="text-right">מזהה משחק: {id}</p>
    </div>
  );
};