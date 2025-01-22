import { RoleSelector } from "../RoleSelector";
import { SportBranchSelector } from "../SportBranchSelector";
import type { PlayerFormData } from "../types";

interface RoleAndSportSectionProps {
  formData: PlayerFormData;
  onInputChange: (field: keyof PlayerFormData, value: any) => void;
}

export const RoleAndSportSection = ({
  formData,
  onInputChange,
}: RoleAndSportSectionProps) => {
  return (
    <div className="space-y-6">
      <RoleSelector
        selectedRoles={formData.roles}
        onToggleRole={(role) => {
          const newRoles = formData.roles.includes(role)
            ? formData.roles.filter(r => r !== role)
            : [...formData.roles, role];
          onInputChange("roles", newRoles);
        }}
      />
      <SportBranchSelector
        value={formData.sportBranches}
        onChange={(value) => onInputChange("sportBranches", value)}
        isPlayer={formData.roles.includes("player")}
      />
    </div>
  );
};