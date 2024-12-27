import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlayerFormProps {
  onSubmit: (data: PlayerFormData) => void;
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
        toast({
          title: "שגיאה",
          description: "לא נמצא משתמש מחובר",
          variant: "destructive",
        });
        return;
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

      onSubmit(formData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הפרטים",
        variant: "destructive",
      });
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
        <div>
          <label htmlFor="fullName" className="block text-right mb-2">שם מלא</label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="text-right"
            placeholder="הכנס את שמך המלא"
          />
        </div>

        <div>
          <label className="block text-right mb-2">תפקידים</label>
          <div className="space-y-2">
            {["מאמן", "שחקן", "אנליסט", "מאמן מנטלי"].map((role) => (
              <Button
                key={role}
                type="button"
                variant={selectedRoles.includes(role) ? "default" : "outline"}
                className="ml-2 mb-2"
                onClick={() => toggleRole(role)}
              >
                {role}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-right mb-2">מספר טלפון</label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="text-right"
            placeholder="הכנס את מספר הטלפון שלך"
          />
        </div>

        <div>
          <label htmlFor="profilePicture" className="block text-right mb-2">תמונת פרופיל</label>
          <Input
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-right"
          />
        </div>

        <div>
          <label htmlFor="club" className="block text-right mb-2">מועדון</label>
          <Input
            id="club"
            value={formData.club}
            onChange={(e) => setFormData({ ...formData, club: e.target.value })}
            className="text-right"
            placeholder="הכנס את שם המועדון שלך"
          />
        </div>

        <div>
          <label htmlFor="teamYear" className="block text-right mb-2">שנת קבוצה</label>
          <Input
            id="teamYear"
            type="number"
            value={formData.teamYear}
            onChange={(e) => setFormData({ ...formData, teamYear: e.target.value })}
            className="text-right"
            placeholder="הכנס את שנת הקבוצה"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-right mb-2">תאריך לידה</label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            className="text-right"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        שמור פרטים
      </Button>
    </form>
  );
};