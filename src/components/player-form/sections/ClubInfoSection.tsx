import { FormField } from "../FormField";
import type { PlayerFormData } from "../types";

interface ClubInfoSectionProps {
  formData: PlayerFormData;
  onInputChange: (field: keyof PlayerFormData, value: any) => void;
}

export const ClubInfoSection = ({
  formData,
  onInputChange,
}: ClubInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        id="club"
        label="מועדון"
        type="text"
        value={formData.club}
        onChange={(value) => onInputChange("club", value)}
      />
      <FormField
        id="coachEmail"
        label="אימייל מאמן"
        type="email"
        value={formData.coachEmail}
        onChange={(value) => onInputChange("coachEmail", value)}
      />
    </div>
  );
};