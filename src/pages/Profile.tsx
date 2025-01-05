import { useEffect, useState } from "react";
import { PlayerForm } from "@/components/PlayerForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PlayerFormData } from "@/components/player-form/types";

const Profile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<PlayerFormData | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("לא נמצא משתמש מחובר");
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
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
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הפרופיל",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [toast]);

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