import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FormField } from "./player-form/FormField";
import { RoleSelector } from "./player-form/RoleSelector";
import { ProfileUpdateService } from "./player-form/ProfileUpdateService";
import type { PlayerFormData } from "./player-form/types";
import { SportBranchSelector } from "./player-form/SportBranchSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// These values must match exactly with the database constraint
const AGE_CATEGORIES = [
  { value: 'ילדים', label: 'ילדים' },
  { value: 'נערים', label: 'נערים' },
  { value: 'נוער', label: 'נוער' },
  { value: 'בוגרים', label: 'בוגרים' },
];

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

      // Validate age category
      if (formData.ageCategory && !AGE_CATEGORIES.some(cat => cat.value === formData.ageCategory)) {
        throw new Error("קטגוריית גיל לא חוקית");
      }

      // Clean up the data before sending
      const dataToUpdate = {
        ...formData,
        id: user.id,
        ageCategory: formData.ageCategory || null // Send null if empty to avoid constraint violation
      };

      await ProfileUpdateService.updateProfile(dataToUpdate);

      toast({
        title: "הצלחה",
        description: "הפרופיל עודכן בהצלחה",
      });

      onSubmit?.();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      let errorMessage = "אירעה שגיאה בעדכון הפרופיל";
      
      if (error.message?.includes("profiles_age_category_check")) {
        errorMessage = "קטגוריית גיל לא חוקית. אנא בחר מהרשימה המוצעת";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "שגיאה",
        description: errorMessage,
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
      <FormField
        id="fullName"
        label="שם מלא"
        type="text"
        value={formData.fullName}
        onChange={(value) => handleInputChange("fullName", value)}
        required
      />

      <RoleSelector
        selectedRoles={formData.roles}
        onToggleRole={(role) => {
          const newRoles = formData.roles.includes(role)
            ? formData.roles.filter(r => r !== role)
            : [...formData.roles, role];
          handleInputChange("roles", newRoles);
        }}
      />

      <SportBranchSelector
        value={formData.sportBranches}
        onChange={(value) => handleInputChange("sportBranches", value)}
        isPlayer={formData.roles.includes("player")}
      />

      <FormField
        id="phoneNumber"
        label="מספר טלפון"
        type="tel"
        value={formData.phoneNumber}
        onChange={(value) => handleInputChange("phoneNumber", value)}
        required
      />

      <FormField
        id="club"
        label="מועדון"
        type="text"
        value={formData.club}
        onChange={(value) => handleInputChange("club", value)}
      />

      <FormField
        id="teamYear"
        label="שנתון"
        type="number"
        value={formData.teamYear}
        onChange={(value) => handleInputChange("teamYear", value)}
      />

      <FormField
        id="dateOfBirth"
        label="תאריך לידה"
        type="date"
        value={formData.dateOfBirth}
        onChange={(value) => handleInputChange("dateOfBirth", value)}
      />

      <div>
        <label htmlFor="ageCategory" className="block text-right mb-2">קטגוריית גיל</label>
        <Select
          value={formData.ageCategory}
          onValueChange={(value) => handleInputChange("ageCategory", value)}
        >
          <SelectTrigger className="w-full text-right">
            <SelectValue placeholder="בחר קטגוריית גיל" />
          </SelectTrigger>
          <SelectContent>
            {AGE_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FormField
        id="coachEmail"
        label="אימייל מאמן"
        type="email"
        value={formData.coachEmail}
        onChange={(value) => handleInputChange("coachEmail", value)}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "שומר..." : "שמור"}
      </Button>
    </form>
  );
};