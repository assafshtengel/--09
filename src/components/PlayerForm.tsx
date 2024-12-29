import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "./player-form/FormField";
import { RoleSelector } from "./player-form/RoleSelector";
import { ProfilePictureUpload } from "./player-form/ProfilePictureUpload";
import { ProfileUpdateService } from "./player-form/ProfileUpdateService";
import type { PlayerFormData, PlayerFormProps } from "./player-form/types";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PlayerForm = ({ onSubmit }: PlayerFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    fullName: "",
    roles: [],
    phoneNumber: "",
    club: "",
    teamYear: "",
    dateOfBirth: "",
    ageCategory: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  const ageCategories = [
    "טרום א'",
    "טרום ב'",
    "ילדים א'",
    "ילדים ב'",
    "ילדים ג'",
    "נערים א'",
    "נערים ב'",
    "נערים ג'",
    "נוער",
    "בוגרים",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phoneNumber || !formData.club || !formData.teamYear || !formData.dateOfBirth || !formData.ageCategory || selectedRoles.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await ProfileUpdateService.updateProfile(
        { ...formData, roles: selectedRoles },
        profilePictureUrl
      );

      toast({
        title: "הצלחה",
        description: "הפרטים נשמרו בהצלחה",
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate("/dashboard");
      
      if (onSubmit) {
        await onSubmit();
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בשמירת הפרטים",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md mx-auto p-6">
      <div className="space-y-4">
        <FormField
          id="fullName"
          label="שם מלא"
          value={formData.fullName}
          onChange={(value) => setFormData({ ...formData, fullName: value })}
          placeholder="הכנס את שמך המלא"
        />

        <RoleSelector
          selectedRoles={selectedRoles}
          onToggleRole={toggleRole}
        />

        <FormField
          id="phoneNumber"
          label="מספר טלפון"
          value={formData.phoneNumber}
          onChange={(value) => setFormData({ ...formData, phoneNumber: value })}
          placeholder="הכנס את מספר הטלפון שלך"
        />

        <div className="space-y-2">
          <label className="block text-right">תמונת פרופיל</label>
          <ProfilePictureUpload
            onUploadComplete={setProfilePictureUrl}
            onUploadError={(error) => {
              toast({
                title: "שגיאה",
                description: error.message || "אירעה שגיאה בהעלאת התמונה",
                variant: "destructive",
              });
            }}
          />
        </div>

        <FormField
          id="club"
          label="מועדון"
          value={formData.club}
          onChange={(value) => setFormData({ ...formData, club: value })}
          placeholder="הכנס את שם המועדון שלך"
        />

        <div className="space-y-2">
          <label className="block text-right">קטגוריית גיל</label>
          <Select
            value={formData.ageCategory}
            onValueChange={(value) => setFormData({ ...formData, ageCategory: value })}
          >
            <SelectTrigger className="w-full text-right">
              <SelectValue placeholder="בחר קטגוריית גיל" />
            </SelectTrigger>
            <SelectContent>
              {ageCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormField
          id="teamYear"
          label="שנת קבוצה"
          value={formData.teamYear}
          onChange={(value) => setFormData({ ...formData, teamYear: value })}
          type="number"
          placeholder="הכנס את שנת הקבוצה"
        />

        <FormField
          id="dateOfBirth"
          label="תאריך לידה"
          value={formData.dateOfBirth}
          onChange={(value) => setFormData({ ...formData, dateOfBirth: value })}
          type="date"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "שומר..." : "שמור פרטים"}
      </Button>
    </form>
  );
};