import { useEffect, useState } from "react";
import { PlayerForm } from "@/components/PlayerForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { PlayerFormData } from "@/components/player-form/types";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<PlayerFormData | null>(null);

  useEffect(() => {
    const checkSessionAndLoadProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw new Error("אירעה שגיאה באימות המשתמש");
        }

        if (!session) {
          console.log("No active session found");
          navigate("/auth");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        if (profile) {
          setProfileData({
            fullName: profile.full_name || "",
            roles: profile.roles || [],
            phoneNumber: profile.phone_number || "",
            club: profile.club || "",
            teamYear: profile.team_year?.toString() || "",
            dateOfBirth: profile.date_of_birth || "",
            ageCategory: profile.age_category || "",
            coachEmail: profile.coach_email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "שגיאה",
          description: error.message || "אירעה שגיאה בטעינת הפרופיל",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    checkSessionAndLoadProfile();

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-right">הפרופיל שלי</h1>
          <PlayerForm 
            initialData={profileData}
            onSubmit={() => {
              toast({
                title: "הצלחה",
                description: "הפרופיל עודכן בהצלחה",
              });
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;