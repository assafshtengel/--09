import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerForm } from "@/components/PlayerForm";

const Player = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select()
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setHasProfile(true);
          // אם יש פרופיל, נעביר את המשתמש לדשבורד
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הפרופיל",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [navigate, toast]);

  const handleFormSubmit = async () => {
    // לאחר שמירה מוצלחת, נעביר את המשתמש לדשבורד
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  if (!hasProfile) {
    return <PlayerForm onSubmit={handleFormSubmit} />;
  }

  return null;
};

export default Player;