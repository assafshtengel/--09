import { useEffect, useState } from "react";
import { PlayerForm } from "@/components/PlayerForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { PlayerFormData } from "@/components/player-form/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log("[Profile] Loading profile data...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("[Profile] Session error:", sessionError);
        throw new Error("אירעה שגיאה באימות המשתמש");
      }

      if (!session) {
        console.log("[Profile] No active session found");
        navigate("/auth");
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("[Profile] Profile fetch error:", profileError);
        throw profileError;
      }

      if (profile) {
        console.log("[Profile] Profile loaded successfully");
        return {
          fullName: profile.full_name || "",
          roles: profile.roles || [],
          phoneNumber: profile.phone_number || "",
          club: profile.club || "",
          dateOfBirth: profile.date_of_birth || "",
          coachEmail: profile.coach_email || "",
          sportBranches: profile.sport_branches || [],
        };
      }

      return null;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (error) {
    toast({
      title: "שגיאה",
      description: error instanceof Error ? error.message : "אירעה שגיאה בטעינת הפרופיל",
      variant: "destructive",
    });
  }

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