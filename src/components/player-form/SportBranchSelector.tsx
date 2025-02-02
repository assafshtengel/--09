import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface SportBranchSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  isPlayer: boolean;
}

const SPORT_OPTIONS = [
  { id: "football", label: "כדורגל" },
  { id: "basketball", label: "כדורסל" },
  { id: "tennis", label: "טניס" },
];

export const SportBranchSelector = ({
  value = [], // Add default empty array
  onChange,
  isPlayer,
}: SportBranchSelectorProps) => {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  if (isPlayer) {
    return (
      <div className="space-y-2">
        <Label>ענף ספורט</Label>
        <Select
          value={safeValue[0] || ""}
          onValueChange={(newValue) => onChange([newValue])}
        >
          <SelectTrigger>
            <SelectValue placeholder="בחר ענף ספורט" />
          </SelectTrigger>
          <SelectContent>
            {SPORT_OPTIONS.map((sport) => (
              <SelectItem key={sport.id} value={sport.id}>
                {sport.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>ענפי ספורט</Label>
      <div className="space-y-2">
        {SPORT_OPTIONS.map((sport) => (
          <div key={sport.id} className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id={sport.id}
              checked={safeValue.includes(sport.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...safeValue, sport.id]);
                } else {
                  onChange(safeValue.filter((v) => v !== sport.id));
                }
              }}
            />
            <Label htmlFor={sport.id}>{sport.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};