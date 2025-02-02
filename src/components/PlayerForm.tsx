import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProfileUpdateService } from "./player-form/ProfileUpdateService";
import type { PlayerFormData } from "./player-form/types";
import { PersonalInfoSection } from "./player-form/sections/PersonalInfoSection";
import { ClubInfoSection } from "./player-form/sections/ClubInfoSection";
import { RoleAndSportSection } from "./player-form/sections/RoleAndSportSection";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PlayerFormProps {
  initialData?: PlayerFormData | null;
  onSubmit?: () => void;
}

export const PlayerForm = ({ initialData, onSubmit }: PlayerFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PlayerFormData>({
    fullName: "",
    roles: [],
    phoneNumber: "",
    club: "",
    dateOfBirth: "",
    coachEmail: "",
    sportBranches: [],
  });

  // Query for profile data with immediate execution
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      console.log("[PlayerForm] Starting profile data fetch");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("[PlayerForm] No user found");
        return null;
      }

      console.log("[PlayerForm] Fetching profile for user:", user.id);
      const profile = await ProfileUpdateService.getProfile(user.id);
      console.log("[PlayerForm] Profile data fetched:", profile);
      return profile;
    },
    staleTime: 0,
    refetchOnMount: true,
    retry: 2,
  });

  // Update form data when initialData or profileData changes
  useEffect(() => {
    console.log("[PlayerForm] Effect triggered with:", { initialData, profileData });
    
    if (initialData) {
      console.log("[PlayerForm] Setting form data from initialData");
      setFormData({
        fullName: initialData.fullName || "",
        roles: initialData.roles || [],
        phoneNumber: initialData.phoneNumber || "",
        club: initialData.club || "",
        dateOfBirth: initialData.dateOfBirth || "",
        coachEmail: initialData.coachEmail || "",
        sportBranches: initialData.sportBranches || [],
      });
      return;
    }

    if (profileData) {
      console.log("[PlayerForm] Setting form data from profileData");
      setFormData({
        fullName: profileData.fullName || "",
        roles: profileData.roles || [],
        phoneNumber: profileData.phoneNumber || "",
        club: profileData.club || "",
        dateOfBirth: profileData.dateOfBirth || "",
        coachEmail: profileData.coachEmail || "",
        sportBranches: profileData.sportBranches || [],
      });
    }
  }, [initialData, profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: PlayerFormData) => {
      console.log("[PlayerForm] Starting profile update with data:", data);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("[PlayerForm] No authenticated user found");
        throw new Error("משתמש לא מחובר");
      }

      console.log("[PlayerForm] Authenticated user:", user.id);

      // Validate required fields
      if (!data.fullName) {
        console.error("[PlayerForm] Missing required field: fullName");
        throw new Error("שם מלא הוא שדה חובה");
      }

      if (!data.roles || data.roles.length === 0) {
        console.error("[PlayerForm] Missing required field: roles");
        throw new Error("יש לבחור לפחות תפקיד אחד");
      }

      // Validate sport branches based on role
      const isPlayer = data.roles.includes("player");
      const hasCoachRole = data.roles.includes("מאמן");

      console.log("[PlayerForm] Role validation - isPlayer:", isPlayer, "hasCoachRole:", hasCoachRole);
      console.log("[PlayerForm] Sport branches:", data.sportBranches);

      if (isPlayer && (!data.sportBranches || data.sportBranches.length !== 1)) {
        console.error("[PlayerForm] Invalid sport branches for player role");
        throw new Error("שחקן חייב לבחור ענף ספורט אחד בדיוק");
      }

      if (hasCoachRole && (!data.sportBranches || data.sportBranches.length === 0)) {
        console.error("[PlayerForm] Invalid sport branches for coach role");
        throw new Error("מאמן חייב לבחור לפחות ענף ספורט אחד");
      }

      console.log("[PlayerForm] Validation passed, updating profile...");
      
      try {
        const updatedProfile = await ProfileUpdateService.updateProfile({
          ...data,
          id: user.id,
        });
        console.log("[PlayerForm] Profile updated successfully:", updatedProfile);
        return updatedProfile;
      } catch (error) {
        console.error("[PlayerForm] Error updating profile:", error);
        throw error;
      }
    },
    onSuccess: (updatedProfile) => {
      console.log("[PlayerForm] Update successful, updating form data:", updatedProfile);
      setFormData(updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "הצלחה",
        description: "הפרופיל עודכן בהצלחה",
      });
      onSubmit?.();
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error("[PlayerForm] Mutation error:", error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בעדכון הפרופיל",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[PlayerForm] Form submitted with data:", formData);
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PlayerFormData, value: any) => {
    console.log("[PlayerForm] Input changed:", field, value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Show loading spinner while fetching initial data
  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoSection 
        formData={formData}
        onInputChange={handleInputChange}
      />
      
      <RoleAndSportSection
        formData={formData}
        onInputChange={handleInputChange}
      />
      
      <ClubInfoSection
        formData={formData}
        onInputChange={handleInputChange}
      />

      <Button 
        type="submit" 
        disabled={updateProfileMutation.isPending}
        className="w-full"
      >
        {updateProfileMutation.isPending ? "שומר..." : "שמור"}
      </Button>
    </form>
  );
};