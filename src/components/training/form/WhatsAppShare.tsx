import { Checkbox } from "@/components/ui/checkbox";

interface WhatsAppShareProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const WhatsAppShare = ({ checked, onCheckedChange }: WhatsAppShareProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="shareWithCoach"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <label
        htmlFor="shareWithCoach"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        שתף את המאמן בסיכום האימון
      </label>
    </div>
  );
};