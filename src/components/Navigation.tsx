import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "התנתקת בהצלחה",
        description: "להתראות!",
      });
      
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהתנתקות",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-white shadow-sm p-4 mb-6">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <Button variant="ghost" onClick={handleSignOut}>
          התנתק
        </Button>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            בית
          </Button>
          <Button variant="ghost" onClick={() => navigate("/profile")}>
            פרופיל
          </Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            לוח בקרה
          </Button>
        </div>
      </div>
    </nav>
  );
};