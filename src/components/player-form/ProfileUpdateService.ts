import { supabase } from "@/integrations/supabase/client";
import type { PlayerFormData } from "./types";

export class ProfileUpdateService {
  static async updateProfile(formData: PlayerFormData, profilePictureUrl: string | null) {
    try {
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        throw new Error('נדרשת התחברות מחדש');
      }

      if (!session) {
        console.error('No active session found after refresh');
        throw new Error('נדרשת התחברות מחדש');
      }

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
          team_year: formData.teamYear ? parseInt(formData.teamYear) : null,
          date_of_birth: formData.dateOfBirth,
          age_category: formData.ageCategory,
          coach_email: formData.coachEmail,
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      return { success: true };
    } catch (error) {
      console.error('Profile update service error:', error);
      throw error;
    }
  }
}