import { supabase } from "@/integrations/supabase/client";
import type { PlayerFormData, ProfileUpdateData } from "./types";

export class ProfileUpdateService {
  static async updateProfile(data: ProfileUpdateData): Promise<PlayerFormData> {
    console.log("[ProfileUpdateService] Starting profile update with data:", {
      ...data,
      id: data.id.slice(0, 8) + '...' // Log partial ID for privacy
    });
    
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        roles: data.roles,
        phone_number: data.phoneNumber,
        club: data.club,
        date_of_birth: data.dateOfBirth || null,
        coach_email: data.coachEmail,
        sport_branches: data.sportBranches,
      })
      .eq("id", data.id);

    if (updateError) {
      console.error("[ProfileUpdateService] Error updating profile:", updateError);
      throw updateError;
    }

    console.log("[ProfileUpdateService] Profile updated successfully, fetching latest data");

    // Fetch the updated profile data
    const { data: updatedProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.id)
      .single();

    if (fetchError) {
      console.error("[ProfileUpdateService] Error fetching updated profile:", fetchError);
      throw fetchError;
    }

    console.log("[ProfileUpdateService] Latest profile data fetched:", {
      ...updatedProfile,
      id: data.id.slice(0, 8) + '...'
    });

    return {
      fullName: updatedProfile.full_name || "",
      roles: updatedProfile.roles || [],
      phoneNumber: updatedProfile.phone_number || "",
      club: updatedProfile.club || "",
      dateOfBirth: updatedProfile.date_of_birth || "",
      coachEmail: updatedProfile.coach_email || "",
      sportBranches: updatedProfile.sport_branches || [],
    };
  }

  static async getProfile(userId: string): Promise<PlayerFormData | null> {
    console.log("[ProfileUpdateService] Fetching profile for user:", userId.slice(0, 8) + '...');
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("[ProfileUpdateService] Error fetching profile:", error);
      throw error;
    }

    if (!data) {
      console.log("[ProfileUpdateService] No profile found for user:", userId.slice(0, 8) + '...');
      return null;
    }

    console.log("[ProfileUpdateService] Profile fetched successfully:", {
      ...data,
      id: userId.slice(0, 8) + '...'
    });
    
    return {
      fullName: data.full_name || "",
      roles: data.roles || [],
      phoneNumber: data.phone_number || "",
      club: data.club || "",
      dateOfBirth: data.date_of_birth || "",
      coachEmail: data.coach_email || "",
      sportBranches: data.sport_branches || [],
    };
  }
}