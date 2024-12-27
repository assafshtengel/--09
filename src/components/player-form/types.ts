export interface PlayerFormData {
  fullName: string;
  roles: string[];
  phoneNumber: string;
  club: string;
  teamYear: string;
  dateOfBirth: string;
  profilePicture?: File;
}

export interface PlayerFormProps {
  onSubmit: () => void;
}