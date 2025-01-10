import { supabase } from "@/integrations/supabase/client";
import type { PlayerFormData } from "./types";

export class ProfileUpdateService {
  static async updateProfile(formData: PlayerFormData, profilePictureUrl: string | null) {
    try {
      const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        throw new Error('נדרשת התחברות מחדש');
      }

      if (!sessionData.session) {
        console.error('No active session found after refresh');
        throw new Error('נדרשת התחברות מחדש');
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User error:', userError);
        throw new Error('אירעה שגיאה בקבלת פרטי המשתמש');
      }

      if (!userData.user?.id || !userData.user?.email) {
        console.error('Missing user data:', userData.user);
        throw new Error('חסרים פרטי משתמש חיוניים');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          email: userData.user.email,
          full_name: formData.fullName,
          roles: formData.roles,
          phone_number: formData.phoneNumber,
          profile_picture_url: profilePictureUrl,
          club: formData.club,
          team_year: parseInt(formData.teamYear),
          date_of_birth: formData.dateOfBirth,
          age_category: formData.ageCategory,
          coach_email: formData.coachEmail,
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      return { user: userData.user };
    } catch (error) {
      console.error('Profile update service error:', error);
      throw error;
    }
  }
}