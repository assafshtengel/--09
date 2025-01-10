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

  const checkProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        navigate("/");
        return;
      }

      if (!user) {
        console.log("No user found, redirecting to home");
        navigate("/");
        return;
      }

      console.log("Checking profile for user:", user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      console.log("Profile data:", profile);

      // בדיקה אם יש פרופיל מלא
      const hasCompleteProfile = profile && 
        profile.full_name && 
        profile.roles && 
        profile.roles.length > 0 && 
        profile.phone_number && 
        profile.club && 
        profile.team_year && 
        profile.date_of_birth;

      if (hasCompleteProfile) {
        console.log("Valid profile found, navigating to dashboard");
        setHasProfile(true);
        navigate("/dashboard");
      } else {
        console.log("Incomplete profile, staying on form");
        setHasProfile(false);
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

  useEffect(() => {
    checkProfile();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">טוען...</div>;
  }

  if (!hasProfile) {
    return <PlayerForm onSubmit={handleFormSubmit} />;
  }

  return null;
};

export default Player;