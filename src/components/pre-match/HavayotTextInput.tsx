import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

interface HavayotTextInputProps {
  onSubmit: (havayot: Record<string, string>) => void;
}

export const HavayotTextInput = ({ onSubmit }: HavayotTextInputProps) => {
  const [professionalHavaya, setProfessionalHavaya] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (professionalHavaya.trim()) {
      onSubmit({ professional: professionalHavaya });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">מקצועי (טכני/טקטי)</h2>
        <p className="text-gray-600">
          איך אתה מרגיש מבחינה מקצועית לקראת המשחק?
        </p>
      </div>

      <div className="bg-blue-50/50 p-4 rounded-lg space-y-3">
        <div className="flex items-start gap-2">
          <div className="bg-blue-500 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center text-sm mt-0.5">
            ℹ️
          </div>
          <div className="text-sm text-blue-800">
            <p>התהליך הוכיח כי כאשר שחקן כותב את ההוויה בעצמו, ולא רק בוחר מתוך אפשרויות קיימות, המחויבות שלו למימוש עולה משמעותית. הכתיבה</p>
            <p>האישית מחזקת את המחויבות והחיבור לרגשי לחוויה.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Input
            value={professionalHavaya}
            onChange={(e) => setProfessionalHavaya(e.target.value)}
            placeholder="רשום את ההוויה שאיתה אתה מגיע למשחק בתחום המקצועי (טכני/טקטי)"
            className="h-14 text-right"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!professionalHavaya.trim()}
        >
          המשך
          <ChevronLeft className="mr-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};