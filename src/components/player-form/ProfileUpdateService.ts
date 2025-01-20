import { supabase } from "@/integrations/supabase/client";
import type { PlayerFormData, ProfileUpdateData } from "./types";

export class ProfileUpdateService {
  static async updateProfile(data: ProfileUpdateData): Promise<void> {
    const { error } = await supabase
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

    if (error) {
      throw error;
    }
  }

  static async getProfile(userId: string): Promise<PlayerFormData | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

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