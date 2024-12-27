import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlayerForm } from "@/components/PlayerForm";

const Player = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select()
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.full_name) {
          setHasProfile(true);
          // אם יש פרופיל, נעביר את המשתמש לדשבורד
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת הפרופיל",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [navigate, toast]);

  const handleFormSubmit = async () => {
    // לאחר שמירה מוצלחת, נעביר את המשתמש לדשבורד
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div>טוען...</div>;
  }

  if (!hasProfile) {
    return <PlayerForm onSubmit={handleFormSubmit} />;
  }

  return null;
};

export default Player;
נעדכן את src/components/PlayerForm.tsx:
src/components/PlayerForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlayerFormProps {
  onSubmit: () => void;
}

export interface PlayerFormData {
  fullName: string;
  roles: string[];
  phoneNumber: string;
  club: string;
  teamYear: string;
  dateOfBirth: string;
  profilePicture?: File;
}

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

      // קורא ל-onSubmit רק לאחר שמירה מוצלחת
      onSubmit();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בשמירת הפרטים",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // ... keep existing code (handleFileChange, toggleRole, and form JSX)
};
