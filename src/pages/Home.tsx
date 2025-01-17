import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ברוכים הבאים</h1>
      <p className="text-gray-600">
        ברוך הבא למערכת. בחר אפשרות מהתפריט למעלה כדי להתחיל.
      </p>
    </div>
  );
};

export default Home;