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
        team_year: data.teamYear ? parseInt(data.teamYear) : null,
        date_of_birth: data.dateOfBirth || null,
        age_category: data.ageCategory,
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
      teamYear: data.team_year?.toString() || "",
      dateOfBirth: data.date_of_birth || "",
      ageCategory: data.age_category || "",
      coachEmail: data.coach_email || "",
      sportBranches: data.sport_branches || [],
    };
  }
}