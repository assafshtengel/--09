import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להתנתק",
        variant: "destructive",
      });
      return;
    }
    navigate("/auth");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8 items-center">
            <Link to="/dashboard" className="text-gray-900 hover:text-gray-700">
              דף הבית
            </Link>
            <Link to="/game-selection" className="text-gray-900 hover:text-gray-700">
              מעקב משחק
            </Link>
            <Link to="/pre-game-planner" className="text-gray-900 hover:text-gray-700">
              יעדים לפני משחק
            </Link>
            <Link to="/training-summary" className="text-gray-900 hover:text-gray-700">
              סיכום אימון
            </Link>
            <Link to="/weekly-planner" className="text-gray-900 hover:text-gray-700">
              תכנון שבועי
            </Link>
            <Link to="/game-history" className="text-gray-900 hover:text-gray-700">
              היסטוריית משחקים
            </Link>
            <Link to="/portfolio" className="text-gray-900 hover:text-gray-700">
              פורטפוליו
            </Link>
            <Link to="/mental-learning" className="text-gray-900 hover:text-gray-700">
              למידה מנטלית
            </Link>
            <Link to="/notifications" className="text-gray-900 hover:text-gray-700">
              התראות
            </Link>
            <Link to="/profile" className="text-gray-900 hover:text-gray-700">
              פרופיל
            </Link>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="text-gray-900 hover:text-gray-700"
              onClick={handleSignOut}
            >
              התנתק
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};