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

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        // Check if profile exists and has required fields
        if (profile && profile.full_name && profile.roles && profile.roles.length > 0) {
          setHasProfile(true);
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

  const handleFormSubmit = () => {
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  if (!hasProfile) {
    return <PlayerForm onSubmit={handleFormSubmit} />;
  }

  return null;
};

export default Player;