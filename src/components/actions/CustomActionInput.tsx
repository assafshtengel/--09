import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomActionInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export const CustomActionInput = ({ value, onChange, onAdd }: CustomActionInputProps) => {
  return (
    <div className="flex gap-2 mt-4">
      <Button 
        type="button" 
        variant="outline"
        onClick={onAdd}
      >
        הוסף
      </Button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="הוסף פעולה מותאמת אישית"
        className="text-right"
      />
    </div>
  );
};