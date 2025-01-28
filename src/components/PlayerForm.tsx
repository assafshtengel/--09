import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProfileUpdateService } from "./player-form/ProfileUpdateService";
import type { PlayerFormData } from "./player-form/types";
import { PersonalInfoSection } from "./player-form/sections/PersonalInfoSection";
import { ClubInfoSection } from "./player-form/sections/ClubInfoSection";
import { RoleAndSportSection } from "./player-form/sections/RoleAndSportSection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: PlayerFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("משתמש לא מחובר");
      }

      // Validate required fields
      if (!data.fullName) {
        throw new Error("שם מלא הוא שדה חובה");
      }

      if (data.roles.length === 0) {
        throw new Error("יש לבחור לפחות תפקיד אחד");
      }

      // Validate sport branches based on role
      const isPlayer = data.roles.includes("player");
      const hasCoachRole = data.roles.includes("מאמן");

      if (isPlayer && data.sportBranches.length !== 1) {
        throw new Error("שחקן חייב לבחור ענף ספורט אחד בדיוק");
      }

      if (hasCoachRole && data.sportBranches.length === 0) {
        throw new Error("מאמן חייב לבחור לפחות ענף ספורט אחד");
      }

      await ProfileUpdateService.updateProfile({
        ...data,
        id: user.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "הצלחה",
        description: "הפרופיל עודכן בהצלחה",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onSubmit?.();
      // Navigate to dashboard after successful save
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error("Error updating profile:", error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בעדכון הפרופיל",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PlayerFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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