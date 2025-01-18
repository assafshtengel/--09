import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField } from "./player-form/FormField";
import { RoleSelector } from "./player-form/RoleSelector";
import { ProfileUpdateService } from "./player-form/ProfileUpdateService";
import type { PlayerFormData } from "./player-form/types";
import { SportBranchSelector } from "./player-form/SportBranchSelector";

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
    teamYear: "",
    dateOfBirth: "",
    ageCategory: "",
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
        throw new Error("No authenticated user found");
      }

      // Validate sport branches based on role
      const isPlayer = formData.roles.includes("player");
      if (isPlayer && formData.sportBranches.length !== 1) {
        throw new Error("שחקן חייב לבחור ענף ספורט אחד בדיוק");
      }
      if (!isPlayer && formData.sportBranches.length === 0) {
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
    } catch (error) {
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

  const isPlayer = formData.roles.includes("player");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="שם מלא"
        type="text"
        value={formData.fullName}
        onChange={(e) => handleInputChange("fullName", e.target.value)}
        required
      />

      <RoleSelector
        value={formData.roles}
        onChange={(value) => handleInputChange("roles", value)}
      />

      <SportBranchSelector
        value={formData.sportBranches}
        onChange={(value) => handleInputChange("sportBranches", value)}
        isPlayer={isPlayer}
      />

      <FormField
        label="מספר טלפון"
        type="tel"
        value={formData.phoneNumber}
        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
        required
      />

      <FormField
        label="מועדון"
        type="text"
        value={formData.club}
        onChange={(e) => handleInputChange("club", e.target.value)}
      />

      <FormField
        label="שנתון"
        type="number"
        value={formData.teamYear}
        onChange={(e) => handleInputChange("teamYear", e.target.value)}
      />

      <FormField
        label="תאריך לידה"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
      />

      <FormField
        label="קטגוריית גיל"
        type="text"
        value={formData.ageCategory}
        onChange={(e) => handleInputChange("ageCategory", e.target.value)}
      />

      <FormField
        label="אימייל מאמן"
        type="email"
        value={formData.coachEmail}
        onChange={(e) => handleInputChange("coachEmail", e.target.value)}
      />

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "שומר..." : "שמור"}
      </Button>
    </form>
  );
};