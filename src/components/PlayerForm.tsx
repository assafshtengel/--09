import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "./player-form/FormField";
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
    dateOfBirth: "",
    ageCategory: "",
    coachPhoneNumber: "",
    coachEmail: "",
  });
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
    
    if (!formData.fullName || !formData.phoneNumber || !formData.club || !formData.dateOfBirth || !formData.ageCategory || !formData.coachPhoneNumber || !formData.coachEmail) {
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
        formData,
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
          id="coachPhoneNumber"
          label="מספר טלפון של המאמן"
          value={formData.coachPhoneNumber}
          onChange={(value) => setFormData({ ...formData, coachPhoneNumber: value })}
          placeholder="הכנס את מספר הטלפון של המאמן"
        />

        <FormField
          id="coachEmail"
          label="מייל המאמן"
          value={formData.coachEmail || ""}
          onChange={(value) => setFormData({ ...formData, coachEmail: value })}
          placeholder="הכנס את כתובת המייל של המאמן"
          type="email"
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
