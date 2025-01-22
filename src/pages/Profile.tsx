import { useEffect, useState } from "react";
import { PlayerForm } from "@/components/PlayerForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { PlayerFormData } from "@/components/player-form/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { motion } from "framer-motion";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<PlayerFormData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const loadProfile = async () => {
    try {
      console.log("[Profile] Loading profile data...");
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("[Profile] Session refresh error:", refreshError);
        throw new Error("אירעה שגיאה באימות המשתמש");
      }

      if (!session) {
        console.log("[Profile] No active session found");
        navigate("/auth");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("[Profile] Profile fetch error:", profileError);
        throw profileError;
      }

      if (profile) {
        console.log("[Profile] Profile loaded successfully");
        setProfileData({
          fullName: profile.full_name || "",
          roles: profile.roles || [],
          phoneNumber: profile.phone_number || "",
          club: profile.club || "",
          dateOfBirth: profile.date_of_birth || "",
          coachEmail: profile.coach_email || "",
          sportBranches: profile.sport_branches || [],
        });
      }
    } catch (error: any) {
      console.error("[Profile] Error loading profile:", error);
      
      if (retryCount < MAX_RETRIES) {
        console.log(`[Profile] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setRetryCount(prev => prev + 1);
        setTimeout(loadProfile, 1000 * (retryCount + 1));
        return;
      }

      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בטעינת הפרופיל",
        variant: "destructive",
      });
      
      navigate("/auth");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsRefreshing(true);
        loadProfile();
      }
    });

    loadProfile();

    return () => {
      console.log("[Profile] Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, toast, retryCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-md mx-auto bg-white shadow-sm rounded-lg">
        <ProfileHeader title="הפרופיל שלי" />
        <div className="p-6">
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
    </motion.div>
  );
};

export default Profile;