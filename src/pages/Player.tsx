import { useEffect, useState } from "react";
import { PlayerForm } from "@/components/PlayerForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { PlayerFormData } from "@/components/player-form/types";

const Player = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const checkProfile = async () => {
    try {
      // First check if we have an authenticated session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        navigate("/");
        return;
      }

      if (!session) {
        console.log("No active session, redirecting to home");
        navigate("/");
        return;
      }

      console.log("Checking profile for user:", session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      console.log("Profile data:", profile);

      // Check if profile is complete
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

  const handleFormSubmit = async () => {
    console.log("Form submitted, checking profile");
    await checkProfile();
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