import React from "react";
import { Button } from "@/components/ui/button";

interface RoleSelectorProps {
  selectedRoles: string[];
  onToggleRole: (role: string) => void;
}

export const RoleSelector = ({ selectedRoles, onToggleRole }: RoleSelectorProps) => {
  return (
    <div>
      <label className="block text-right mb-2">תפקידים</label>
      <div className="space-y-2">
        {["מאמן", "שחקן", "אנליסט", "מאמן מנטלי"].map((role) => (
          <Button
            key={role}
            type="button"
            variant={selectedRoles.includes(role) ? "default" : "outline"}
            className="ml-2 mb-2"
            onClick={() => onToggleRole(role)}
          >
            {role}
          </Button>
        ))}
      </div>
    </div>
  );
};