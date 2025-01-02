import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HavayaSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export const HavayaSelector = ({ value, onChange, onNext, onBack }: HavayaSelectorProps) => {
  const [options] = useState<string[]>([
    "חווית 1",
    "חווית 2",
    "חווית 3",
    "חווית 4",
    "חווית 5",
    "חווית 6",
  ]);

  const handleOptionToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-right">בחר חוויות למשחק</h2>
        <p className="text-gray-600 text-right">בחר 3-4 חוויות שתרצה להתמקד בהן במשחק הקרוב</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionToggle(option)}
              className={`p-4 border rounded-lg ${value.includes(option) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>
          חזור
        </Button>
        <Button 
          onClick={onNext}
          disabled={value.length < 3}
        >
          המשך
          <ArrowRight className="mr-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};