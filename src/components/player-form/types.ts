export interface PlayerFormData {
  fullName: string;
  roles: string[];
  phoneNumber: string;
  club: string;
  dateOfBirth: string;
  profilePicture?: File;
  ageCategory?: string;
  coachPhoneNumber?: string;
  coachEmail?: string;
}

export interface PlayerFormProps {
  onSubmit: () => void;
}