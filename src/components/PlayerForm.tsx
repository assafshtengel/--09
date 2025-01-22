import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProfileUpdateService } from "./player-form/ProfileUpdateService";
import type { PlayerFormData } from "./player-form/types";
import { PersonalInfoSection } from "./player-form/sections/PersonalInfoSection";
import { ClubInfoSection } from "./player-form/sections/ClubInfoSection";
import { RoleAndSportSection } from "./player-form/sections/RoleAndSportSection";

interface PlayerFormProps {
  initialData?: PlayerFormData | null;
  onSubmit?: () => void;
}

export const PlayerForm = ({ initialData, onSubmit }: PlayerFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("משתמש לא מחובר");
      }

      // Validate required fields
      if (!formData.fullName) {
        throw new Error("שם מלא הוא שדה חובה");
      }

      if (formData.roles.length === 0) {
        throw new Error("יש לבחור לפחות תפקיד אחד");
      }

      // Validate sport branches based on role
      const isPlayer = formData.roles.includes("player");
      const hasCoachRole = formData.roles.includes("מאמן");

      if (isPlayer && formData.sportBranches.length !== 1) {
        throw new Error("שחקן חייב לבחור ענף ספורט אחד בדיוק");
      }

      if (hasCoachRole && formData.sportBranches.length === 0) {
        throw new Error("מאמן חייב לבחור לפחות ענף ספורט אחד");
      }

      await ProfileUpdateService.updateProfile({
        ...formData,
        id: user.id,
      });

      toast({
        title: "הצלחה",
        description: "הפרופיל עודכן בהצלחה",
      });

      onSubmit?.();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בעדכון הפרופיל",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "שומר..." : "שמור"}
      </Button>
    </form>
  );
};