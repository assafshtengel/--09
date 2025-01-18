export interface PlayerFormData {
  fullName: string;
  roles: string[];
  phoneNumber: string;
  club: string;
  teamYear: string;
  dateOfBirth: string;
  ageCategory: string;
  coachEmail: string;
  sportBranches: string[];
}

export interface ProfileUpdateData extends PlayerFormData {
  id: string;
}