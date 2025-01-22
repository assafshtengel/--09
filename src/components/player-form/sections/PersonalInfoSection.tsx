import { FormField } from "../FormField";
import type { PlayerFormData } from "../types";

interface PersonalInfoSectionProps {
  formData: PlayerFormData;
  onInputChange: (field: keyof PlayerFormData, value: any) => void;
}

export const PersonalInfoSection = ({
  formData,
  onInputChange,
}: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        id="fullName"
        label="שם מלא"
        type="text"
        value={formData.fullName}
        onChange={(value) => onInputChange("fullName", value)}
        required
      />
      <FormField
        id="phoneNumber"
        label="מספר טלפון"
        type="tel"
        value={formData.phoneNumber}
        onChange={(value) => onInputChange("phoneNumber", value)}
        required
      />
      <FormField
        id="dateOfBirth"
        label="תאריך לידה"
        type="date"
        value={formData.dateOfBirth}
        onChange={(value) => onInputChange("dateOfBirth", value)}
      />
    </div>
  );
};