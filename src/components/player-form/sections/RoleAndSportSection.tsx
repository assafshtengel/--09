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
  // Ensure roles is always an array
  const roles = formData?.roles || [];
  
  // Check if user is a player (using the normalized roles array)
  const isPlayer = roles.includes("player");

  return (
    <div className="space-y-6">
      <RoleSelector
        selectedRoles={roles}
        onToggleRole={(role) => {
          const newRoles = roles.includes(role)
            ? roles.filter(r => r !== role)
            : [...roles, role];
          onInputChange("roles", newRoles);
        }}
      />
      <SportBranchSelector
        value={formData.sportBranches || []}
        onChange={(value) => onInputChange("sportBranches", value)}
        isPlayer={isPlayer}
      />
    </div>
  );
};