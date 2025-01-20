export interface PlayerFormData {
  fullName: string;
  roles: string[];
  phoneNumber: string;
  club: string;
  dateOfBirth: string;
  coachEmail: string;
  sportBranches: string[];
}

export interface ProfileUpdateData extends PlayerFormData {
  id: string;
}