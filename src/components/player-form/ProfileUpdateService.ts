import { supabase } from "@/integrations/supabase/client";
import type { PlayerFormData } from "./types";

export class ProfileUpdateService {
  static async updateProfile(formData: PlayerFormData, profilePictureUrl: string | null) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
      throw new Error('אירעה שגיאה בקבלת פרטי המשתמש');
    }

    if (!user?.id || !user?.email) {
      console.error('Missing user data:', user);
      throw new Error('חסרים פרטי משתמש חיוניים');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: formData.fullName,
        roles: formData.roles,
        phone_number: formData.phoneNumber,
        profile_picture_url: profilePictureUrl,
        club: formData.club,
        team_year: parseInt(formData.teamYear),
        date_of_birth: formData.dateOfBirth,
      });

    if (updateError) {
      console.error('Profile update error:', updateError);
      throw updateError;
    }

    return { user };
  }
}