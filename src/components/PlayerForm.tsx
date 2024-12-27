import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "./player-form/FormField";
import { RoleSelector } from "./player-form/RoleSelector";
import type { PlayerFormData, PlayerFormProps } from "./player-form/types";

export const PlayerForm = ({ onSubmit }: PlayerFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    fullName: "",
    roles: [],
    phoneNumber: "",
    club: "",
    teamYear: "",
    dateOfBirth: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phoneNumber || !formData.club || !formData.teamYear || !formData.dateOfBirth || selectedRoles.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא מלא את כל השדות",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let profilePictureUrl = null;
      
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, profilePicture);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(filePath);

        profilePictureUrl = publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('לא נמצא משתמש מחובר');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          roles: selectedRoles,
          phone_number: formData.phoneNumber,
          profile_picture_url: profilePictureUrl,
          club: formData.club,
          team_year: parseInt(formData.teamYear),
          date_of_birth: formData.dateOfBirth,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "הצלחה",
        description: "הפרטים נשמרו בהצלחה",
      });

      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בשמירת הפרטים",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
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

        <FormField
          id="profilePicture"
          label="תמונת פרופיל"
          value=""
          type="file"
          accept="image/*"
          onFileChange={handleFileChange}
          onChange={() => {}}
        />

        <FormField
          id="club"
          label="מועדון"
          value={formData.club}
          onChange={(value) => setFormData({ ...formData, club: value })}
          placeholder="הכנס את שם המועדון שלך"
        />

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